-- ==============================================================================
-- Migration: 20260915161000_publish_listing_rpc_and_status_guard.sql
-- Description: Establishes publish_listing(p_listing_id) as the sole transactional
--              publication authority and guards direct client listing status mutation.
-- ==============================================================================

-- 1. Direct Listing Publication Guard Trigger Function
CREATE OR REPLACE FUNCTION public.guard_direct_listing_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'published'::public.listing_status AND OLD.status <> 'published'::public.listing_status THEN
    IF current_setting('elitestay.authorized_publication', true) <> 'true' THEN
      RAISE EXCEPTION 'Direct listing publication is prohibited. You must use the publish_listing() RPC.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_direct_listing_publication ON public.listings;
CREATE TRIGGER trg_guard_direct_listing_publication
  BEFORE UPDATE OF status ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_direct_listing_publication();

ALTER FUNCTION public.guard_direct_listing_publication() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.guard_direct_listing_publication() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_direct_listing_publication() TO postgres, authenticated;

-- 2. Transactional Publication RPC: publish_listing(p_listing_id uuid)
CREATE OR REPLACE FUNCTION public.publish_listing(p_listing_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_listing public.listings%ROWTYPE;
  v_profile public.host_profiles%ROWTYPE;
  v_missing text[] := ARRAY[]::text[];
  v_has_photos boolean;
  v_has_pricing boolean;
  v_has_location boolean;
BEGIN
  -- 1. Caller authentication
  v_user_id := (SELECT auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  -- 2. Lock listing row
  SELECT *
    INTO v_listing
  FROM public.listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'LISTING_NOT_FOUND',
      'code', '404'
    );
  END IF;

  -- 3. Verify Listing Ownership
  IF v_listing.host_id <> v_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED_NOT_OWNER',
      'code', '403'
    );
  END IF;

  -- 4. Idempotent check: already published
  IF v_listing.status = 'published'::public.listing_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'published',
      'message', 'ALREADY_PUBLISHED'
    );
  END IF;

  -- 5. Lock host profile row
  SELECT *
    INTO v_profile
  FROM public.host_profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HOST_PROFILE_NOT_FOUND',
      'code', '404'
    );
  END IF;

  -- 6. Host Status Check (must be READY or ACTIVE; ONBOARDING / NOT_STARTED cannot publish)
  IF v_profile.status NOT IN ('READY'::public.host_status, 'ACTIVE'::public.host_status) THEN
    v_missing := array_append(v_missing, 'HOST_ONBOARDING_NOT_COMPLETED');
  END IF;

  -- 7. Host Compliance Checks
  -- 7.1 Identity verification (VERIFIED)
  IF v_profile.identity_verification_status <> 'VERIFIED'::public.host_verification_status OR v_profile.identity_verified_at IS NULL THEN
    v_missing := array_append(v_missing, 'IDENTITY_VERIFICATION_REQUIRED');
  END IF;

  -- 7.2 Payout bank account linked & verified
  IF (v_profile.bank_name IS NULL OR length(trim(v_profile.bank_name)) = 0) AND 
     (v_profile.bank_account_last4 IS NULL OR length(trim(v_profile.bank_account_last4)) = 0) THEN
    v_missing := array_append(v_missing, 'PAYOUT_ACCOUNT_REQUIRED');
  ELSIF v_profile.payout_verification_status <> 'VERIFIED'::public.host_verification_status OR v_profile.payout_verified_at IS NULL THEN
    v_missing := array_append(v_missing, 'PAYOUT_VERIFICATION_REQUIRED');
  END IF;

  -- 7.3 Tax registration & verified
  IF (v_profile.tax_id_last4 IS NULL OR length(trim(v_profile.tax_id_last4)) = 0) AND 
     v_profile.tax_profile_id IS NULL THEN
    v_missing := array_append(v_missing, 'TAX_REGISTRATION_REQUIRED');
  ELSIF v_profile.tax_verification_status <> 'VERIFIED'::public.host_verification_status OR v_profile.tax_verified_at IS NULL THEN
    v_missing := array_append(v_missing, 'TAX_VERIFICATION_REQUIRED');
  END IF;

  -- 7.4 Specialization selected
  IF v_profile.primary_accommodation_type_id IS NULL THEN
    v_missing := array_append(v_missing, 'SPECIALIZATION_REQUIRED');
  END IF;

  -- 7.5 Current mandatory policy versions accepted
  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'ANTI_DISCRIMINATION'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'ANTI_DISCRIMINATION_POLICY_REQUIRED');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'MAINTENANCE_SLA'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'MAINTENANCE_SLA_POLICY_REQUIRED');
  END IF;

  -- 8. Listing Health Checks
  -- 8.1 Title present
  IF v_listing.title IS NULL OR LENGTH(TRIM(v_listing.title)) = 0 THEN
    v_missing := array_append(v_missing, 'LISTING_TITLE_REQUIRED');
  END IF;

  -- 8.2 Location & Coordinate Requirements
  v_has_location := (
    (v_listing.city IS NOT NULL AND LENGTH(TRIM(v_listing.city)) > 0) OR
    (v_listing.formatted_address IS NOT NULL AND LENGTH(TRIM(v_listing.formatted_address)) > 0)
  ) AND (v_listing.latitude IS NOT NULL AND v_listing.longitude IS NOT NULL);

  IF NOT v_has_location THEN
    v_missing := array_append(v_missing, 'LISTING_LOCATION_REQUIRED');
  END IF;

  -- 8.3 Pricing configured
  v_has_pricing := EXISTS (
    SELECT 1 FROM public.listing_prices lp 
    WHERE lp.listing_id = v_listing.id AND lp.amount > 0
  );
  IF NOT v_has_pricing THEN
    v_missing := array_append(v_missing, 'LISTING_PRICING_REQUIRED');
  END IF;

  -- 8.4 Photos present
  v_has_photos := EXISTS (
    SELECT 1 FROM public.listing_images li 
    WHERE li.listing_id = v_listing.id
  );
  IF NOT v_has_photos THEN
    v_missing := array_append(v_missing, 'LISTING_PHOTOS_REQUIRED');
  END IF;

  -- 9. Check if any requirements failed
  IF COALESCE(array_length(v_missing, 1), 0) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PUBLICATION_REQUIREMENTS_NOT_MET',
      'missing', v_missing
    );
  END IF;

  -- 10. Atomic Publication
  PERFORM set_config('elitestay.authorized_publication', 'true', true);

  UPDATE public.listings
  SET status = 'published'::public.listing_status,
      updated_at = now()
  WHERE id = v_listing.id;

  -- If host is in READY state, transition host to ACTIVE
  IF v_profile.status = 'READY'::public.host_status THEN
    UPDATE public.host_profiles
    SET status = 'ACTIVE'::public.host_status,
        updated_at = now()
    WHERE id = v_profile.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'published',
    'host_status', 'ACTIVE'
  );
END;
$$;

ALTER FUNCTION public.publish_listing(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.publish_listing(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_listing(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.publish_listing(uuid) TO authenticated;
