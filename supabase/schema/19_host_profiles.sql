/*
==================================================
Domain: Hosting Bounded Context & Host Profile Entity
Purpose: Permanent record for host entity business settings, verified facts, and capabilities without replacing guest roles.
==================================================
*/

CREATE TABLE IF NOT EXISTS public.host_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status public.host_status NOT NULL DEFAULT 'NOT_STARTED'::public.host_status,
    primary_accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE SET NULL,
    bank_account_id UUID,
    bank_name TEXT,
    bank_account_last4 TEXT,
    tax_profile_id UUID,
    tax_id_last4 TEXT,
    tax_id_type TEXT,
    identity_submitted_at TIMESTAMPTZ,
    identity_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (identity_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    identity_verification_ref TEXT,
    identity_verified_at TIMESTAMPTZ,
    payout_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (payout_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    payout_verified_at TIMESTAMPTZ,
    tax_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (tax_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    tax_verified_at TIMESTAMPTZ,
    agreed_to_policies_at TIMESTAMPTZ,
    support_phone TEXT,
    support_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS host_profiles_status_idx ON public.host_profiles(status);
CREATE INDEX IF NOT EXISTS idx_host_profiles_accommodation_type ON public.host_profiles(primary_accommodation_type_id);

ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- Least privilege RLS Policies
CREATE POLICY "Users can view their own host profile"
    ON public.host_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Restrict direct client UPDATE/DELETE privileges
REVOKE ALL ON public.host_profiles FROM PUBLIC, anon;
REVOKE UPDATE, DELETE ON public.host_profiles FROM authenticated;

-- Grant column-level UPDATE only on presentation fields
GRANT UPDATE (support_phone, support_email) ON public.host_profiles TO authenticated;
GRANT SELECT ON public.host_profiles TO authenticated;

-- ==================================================
-- Domain: Host Policy Acceptances (Append-Only)
-- ==================================================

CREATE TABLE IF NOT EXISTS public.host_policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID REFERENCES public.host_profiles(id) ON DELETE CASCADE NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('ANTI_DISCRIMINATION', 'MAINTENANCE_SLA')),
    policy_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_host_policy_acceptances_host_type
    ON public.host_policy_acceptances(host_profile_id, policy_type, policy_version);

ALTER TABLE public.host_policy_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can read own policy acceptances"
    ON public.host_policy_acceptances
    FOR SELECT
    USING (
        host_profile_id IN (
            SELECT id FROM public.host_profiles WHERE user_id = auth.uid()
        )
    );

REVOKE ALL ON public.host_policy_acceptances FROM PUBLIC, anon;
GRANT SELECT ON public.host_policy_acceptances TO authenticated;

-- ==================================================
-- Domain: Controlled Host Transition RPCs
-- ==================================================

CREATE OR REPLACE FUNCTION public.initialize_host_onboarding()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  INSERT INTO public.host_profiles (user_id, status)
  VALUES (v_user_id, 'ONBOARDING'::public.host_status)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.host_profiles
    WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'hostProfileId', v_profile_id,
    'status', (
      SELECT status::text
      FROM public.host_profiles
      WHERE id = v_profile_id
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_host_policy_acceptance(
  p_policy_type text,
  p_policy_version text,
  p_client_context jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_host_profile_id uuid;
  v_acceptance_id uuid;
  v_server_context jsonb;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  IF p_policy_type IS NULL
     OR p_policy_type NOT IN ('ANTI_DISCRIMINATION', 'MAINTENANCE_SLA') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_POLICY_TYPE',
      'code', '400'
    );
  END IF;

  IF p_policy_version IS NULL
     OR length(btrim(p_policy_version)) NOT BETWEEN 1 AND 128 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_POLICY_VERSION',
      'code', '400'
    );
  END IF;

  SELECT id
    INTO v_host_profile_id
  FROM public.host_profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_host_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HOST_PROFILE_NOT_FOUND',
      'code', '404'
    );
  END IF;

  v_server_context := jsonb_build_object(
    'user_agent',
    current_setting('request.headers', true)::json->>'user-agent',
    'x_forwarded_for',
    split_part(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      ',',
      1
    )
  );

  INSERT INTO public.host_policy_acceptances (
    host_profile_id,
    policy_type,
    policy_version,
    client_context
  )
  VALUES (
    v_host_profile_id,
    p_policy_type,
    p_policy_version,
    jsonb_build_object(
      'declared', COALESCE(p_client_context, '{}'::jsonb),
      'request', COALESCE(v_server_context, '{}'::jsonb)
    )
  )
  RETURNING id INTO v_acceptance_id;

  RETURN jsonb_build_object(
    'success', true,
    'acceptanceId', v_acceptance_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_host_to_ready()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
  v_missing text[] := ARRAY[]::text[];
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

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

  IF v_profile.status IN ('READY'::public.host_status, 'ACTIVE'::public.host_status) THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', v_profile.status::text
    );
  END IF;

  IF v_profile.status <> 'ONBOARDING'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'status', v_profile.status::text,
      'code', '409'
    );
  END IF;

  -- 1. Onboarding Requirement 1: Identity Submitted
  IF v_profile.identity_submitted_at IS NULL THEN
    v_missing := array_append(v_missing, 'IDENTITY_NOT_SUBMITTED');
  END IF;

  -- 2. Onboarding Requirement 2: Accommodation Specialization Selected
  IF v_profile.primary_accommodation_type_id IS NULL THEN
    v_missing := array_append(v_missing, 'SPECIALIZATION_NOT_SET');
  END IF;

  -- 3. Onboarding Requirement 3: Mandatory Policies Accepted
  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'ANTI_DISCRIMINATION'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'ANTI_DISCRIMINATION_POLICY_NOT_ACCEPTED');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'MAINTENANCE_SLA'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'MAINTENANCE_SLA_POLICY_NOT_ACCEPTED');
  END IF;

  IF COALESCE(array_length(v_missing, 1), 0) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ONBOARDING_REQUIREMENTS_NOT_MET',
      'missing', v_missing
    );
  END IF;

  UPDATE public.host_profiles
  SET status = 'READY'::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status = 'ONBOARDING'::public.host_status;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'READY'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_host_onboarding() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_host_policy_acceptance(text, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transition_host_to_ready() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.initialize_host_onboarding() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_host_policy_acceptance(text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_host_to_ready() TO authenticated;

-- 8. Controlled RPC: transition_host_to_active
CREATE OR REPLACE FUNCTION public.transition_host_to_active()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

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

  IF v_profile.status = 'ACTIVE'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'ACTIVE'
    );
  END IF;

  IF v_profile.status <> 'READY'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'current_status', v_profile.status::text,
      'message', 'Host must be in READY status to activate',
      'code', '409'
    );
  END IF;

  UPDATE public.host_profiles
  SET status = 'ACTIVE'::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status = 'READY'::public.host_status;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'ACTIVE'
  );
END;
$$;

-- 9. Controlled RPC: transition_host_operational_status
CREATE OR REPLACE FUNCTION public.transition_host_operational_status(p_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('ACTIVE', 'PAUSED') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_STATUS_TARGET',
      'message', 'Operational status can only toggle between ACTIVE and PAUSED',
      'code', '400'
    );
  END IF;

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

  IF v_profile.status::text = p_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', p_status
    );
  END IF;

  IF v_profile.status NOT IN ('ACTIVE'::public.host_status, 'PAUSED'::public.host_status, 'READY'::public.host_status) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'current_status', v_profile.status::text,
      'message', 'Host must be ACTIVE, PAUSED, or READY to toggle operational status',
      'code', '409'
    );
  END IF;

  UPDATE public.host_profiles
  SET status = p_status::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status IN ('ACTIVE'::public.host_status, 'PAUSED'::public.host_status, 'READY'::public.host_status);

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', p_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transition_host_to_active() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transition_host_operational_status(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.transition_host_to_active() TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_host_operational_status(text) TO authenticated;
