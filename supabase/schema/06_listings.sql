/*
==================================================
Domain: Listings
Purpose: Core marketplace domain for property listings and host workflows.
Contains: 
- listings
- listing_amenities
- is_listing_owner helper function
- triggers, RLS, & performance indexes
==================================================
*/

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT UNIQUE NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE RESTRICT NOT NULL,
    property_type TEXT DEFAULT 'Apartment' NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    max_occupants INTEGER DEFAULT 1 NOT NULL,
    occupancy_type public.occupancy_type DEFAULT 'private'::public.occupancy_type NOT NULL,
    gender_preference public.gender_preference DEFAULT 'any'::public.gender_preference NOT NULL,
    furnishing public.furnishing DEFAULT 'unfurnished'::public.furnishing NOT NULL,
    
    -- Location Fields
    state TEXT,
    city TEXT,
    city_id BIGINT REFERENCES public.cities(id) ON DELETE SET NULL,
    locality TEXT,
    locality_id BIGINT REFERENCES public.localities(id),
    postal_code TEXT,
    property_type_id SMALLINT REFERENCES public.property_types(id),
    latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
    formatted_address TEXT,
    available_date DATE DEFAULT CURRENT_DATE NOT NULL,
    
    status public.listing_status DEFAULT 'draft'::public.listing_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT published_listing_requires_coordinates CHECK (
        status <> 'published'
        OR (latitude IS NOT NULL AND longitude IS NOT NULL AND formatted_address IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_listings_public_id ON public.listings(public_id);
CREATE INDEX IF NOT EXISTS idx_listings_host_id ON public.listings(host_id);
CREATE INDEX IF NOT EXISTS idx_listings_lat_lng ON public.listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS listings_city_idx ON public.listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_property_type_id ON public.listings(property_type_id);
CREATE INDEX IF NOT EXISTS idx_listings_locality_id ON public.listings(locality_id);
CREATE INDEX IF NOT EXISTS idx_listings_available_date ON public.listings(available_date);

CREATE OR REPLACE FUNCTION public.is_listing_owner(p_listing_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.listings 
    WHERE id = p_listing_id AND host_id = auth.uid()
  );
END;
$$;

CREATE TABLE public.listing_amenities (
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (listing_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS listing_amenities_amenity_idx ON public.listing_amenities(amenity_id);

-- Triggers & Host Specialization Enforcement
CREATE TRIGGER listings_updated_at 
  BEFORE UPDATE ON public.listings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER listings_set_public_id
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_public_id();

CREATE OR REPLACE FUNCTION public.enforce_host_accommodation_specialization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_host_specialization_id UUID;
BEGIN
  SELECT primary_accommodation_type_id INTO v_host_specialization_id
  FROM public.host_profiles
  WHERE user_id = NEW.host_id;

  IF v_host_specialization_id IS NOT NULL THEN
    IF NEW.accommodation_type_id IS NULL THEN
      NEW.accommodation_type_id := v_host_specialization_id;
    ELSIF NEW.accommodation_type_id <> v_host_specialization_id THEN
      RAISE EXCEPTION 'Host Specialization Rule Violation: Listing accommodation_type_id (%) does not match Host Profile primary_accommodation_type_id (%). Hosts are strictly limited to one accommodation specialization.', NEW.accommodation_type_id, v_host_specialization_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_host_specialization
  BEFORE INSERT OR UPDATE OF accommodation_type_id ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_host_accommodation_specialization();

CREATE TRIGGER listings_prevent_public_id_update
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_prevent_public_id_update();

CREATE TRIGGER listing_amenities_updated_at 
  BEFORE UPDATE ON public.listing_amenities 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;

-- Listings Policies
CREATE POLICY "Public can read published listings" ON public.listings
  FOR SELECT USING (status = 'published'::public.listing_status OR host_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (public.is_host() OR public.is_admin()) AND
    host_id = auth.uid()
  );

CREATE POLICY "Hosts can update own listings" ON public.listings
  FOR UPDATE USING (host_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can delete own listings" ON public.listings
  FOR DELETE USING (host_id = auth.uid() OR public.is_admin());

-- Listing Amenities Policies
CREATE POLICY "Public can view listing amenities" ON public.listing_amenities
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own listing amenities" ON public.listing_amenities
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_amenities.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );

-- Listing Capacity Table & Inherited RLS
CREATE TABLE public.listing_capacity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
    beds INTEGER DEFAULT 1 NOT NULL,
    bathrooms INTEGER DEFAULT 1 NOT NULL,
    max_guests INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_capacity_counts CHECK (beds > 0 AND bathrooms > 0 AND max_guests > 0)
);

CREATE INDEX IF NOT EXISTS idx_listing_capacity_listing_id ON public.listing_capacity(listing_id);

CREATE TRIGGER listing_capacity_updated_at 
    BEFORE UPDATE ON public.listing_capacity
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.listing_capacity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access inherited from listings" ON public.listing_capacity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_capacity.listing_id
              AND (l.status = 'published' OR public.is_listing_owner(l.id) OR public.is_admin())
        )
    );

CREATE POLICY "Allow listing owners to manage capacity" ON public.listing_capacity
    FOR ALL USING (public.is_listing_owner(listing_id) OR public.is_admin())
    WITH CHECK (public.is_listing_owner(listing_id) OR public.is_admin());

-- Listing Features Table (Resident Experience Features)
CREATE TABLE public.listing_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
    has_attached_bathroom BOOLEAN DEFAULT false NOT NULL,
    has_attached_balcony BOOLEAN DEFAULT false NOT NULL,
    has_air_conditioning BOOLEAN DEFAULT false NOT NULL,
    has_lift BOOLEAN DEFAULT false NOT NULL,
    is_wheelchair_accessible BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listing_features_listing_id ON public.listing_features(listing_id);

ALTER TABLE public.listing_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access inherited from listings on features"
    ON public.listing_features FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_features.listing_id
              AND (l.status = 'published' OR public.is_listing_owner(l.id) OR public.is_admin())
        )
    );

CREATE POLICY "Allow owners to manage listing features"
    ON public.listing_features FOR ALL
    USING (public.is_listing_owner(listing_id) OR public.is_admin())
    WITH CHECK (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE TRIGGER trigger_listing_features_updated_at
    BEFORE UPDATE ON public.listing_features
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- Listing Rules Table (Operational Policies)
CREATE TABLE public.listing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
    smoking_allowed BOOLEAN DEFAULT false NOT NULL,
    pets_allowed BOOLEAN DEFAULT false NOT NULL,
    visitors_allowed BOOLEAN DEFAULT true NOT NULL,
    couples_allowed BOOLEAN DEFAULT true NOT NULL,
    non_vegetarian_allowed BOOLEAN DEFAULT true NOT NULL,
    parties_allowed BOOLEAN DEFAULT false NOT NULL,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    gate_closing_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_quiet_hours_pair CHECK (
        (quiet_hours_start IS NULL AND quiet_hours_end IS NULL) OR 
        (quiet_hours_start IS NOT NULL AND quiet_hours_end IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_listing_rules_listing_id ON public.listing_rules(listing_id);

ALTER TABLE public.listing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access inherited from listings on rules"
    ON public.listing_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_rules.listing_id
              AND (l.status = 'published' OR public.is_listing_owner(l.id) OR public.is_admin())
        )
    );

CREATE POLICY "Allow owners to manage listing rules"
    ON public.listing_rules FOR ALL
    USING (public.is_listing_owner(listing_id) OR public.is_admin())
    WITH CHECK (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE TRIGGER trigger_listing_rules_updated_at
    BEFORE UPDATE ON public.listing_rules
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- Listing Rule Notes Table (Normalized Rule Notes)
CREATE TABLE public.listing_rule_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listing_rule_notes_listing_id ON public.listing_rule_notes(listing_id, display_order);

ALTER TABLE public.listing_rule_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access inherited from listings on rule notes"
    ON public.listing_rule_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_rule_notes.listing_id
              AND (l.status = 'published' OR public.is_listing_owner(l.id) OR public.is_admin())
        )
    );

CREATE POLICY "Allow owners to manage listing rule notes"
    ON public.listing_rule_notes FOR ALL
    USING (public.is_listing_owner(listing_id) OR public.is_admin())
    WITH CHECK (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE TRIGGER trigger_listing_rule_notes_updated_at
    BEFORE UPDATE ON public.listing_rule_notes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger to update city listing count in real time
CREATE OR REPLACE FUNCTION public.update_city_listing_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'published' AND NEW.city_id IS NOT NULL) THEN
      UPDATE public.cities 
      SET listing_count = COALESCE(listing_count, 0) + 1 
      WHERE id = NEW.city_id;
    END IF;
  
  -- Handle UPDATE
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Case 1: Status changed to published
    IF (NEW.status = 'published' AND OLD.status <> 'published') THEN
      IF (NEW.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = COALESCE(listing_count, 0) + 1 
        WHERE id = NEW.city_id;
      END IF;
    -- Case 2: Status changed from published
    ELSIF (NEW.status <> 'published' AND OLD.status = 'published') THEN
      IF (OLD.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
        WHERE id = OLD.city_id;
      END IF;
    -- Case 3: Status remained published but city_id changed
    ELSIF (NEW.status = 'published' AND OLD.status = 'published' AND NEW.city_id IS DISTINCT FROM OLD.city_id) THEN
      IF (OLD.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
        WHERE id = OLD.city_id;
      END IF;
      IF (NEW.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = COALESCE(listing_count, 0) + 1 
        WHERE id = NEW.city_id;
      END IF;
    END IF;
  
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'published' AND OLD.city_id IS NOT NULL) THEN
      UPDATE public.cities 
      SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
      WHERE id = OLD.city_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_city_listing_count ON public.listings;
CREATE TRIGGER trg_update_city_listing_count
AFTER INSERT OR UPDATE OR DELETE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.update_city_listing_count();

-- Prevent Protected Listing Deletion Guard
CREATE OR REPLACE FUNCTION public.prevent_protected_listing_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Priority 1: Active legal leases
  IF EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.bookings b ON b.id = l.reservation_id
    WHERE b.listing_id = OLD.id AND l.status IN ('PENDING_SIGNATURE', 'ACTIVE')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active legal lease contract is currently in effect. Active leases must be formally terminated or expired before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 2: Active resident stays
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE listing_id = OLD.id AND status IN ('upcoming', 'active', 'extended')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active resident stay is currently in progress. Stays must be checked out or completed before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 3: Active booking reservations
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE listing_id = OLD.id AND status IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active booking reservation exists. Active bookings must be completed, rejected, or cancelled before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 4: Any historical lease reference
  IF EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.bookings b ON b.id = l.reservation_id
    WHERE b.listing_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: this property has been referenced by a legal lease contract. To retire this property, update status to ''archived'' to preserve statutory financial and tenancy audit history.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 5: Any stay record (unconditional residency history)
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE listing_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: this property has resident stay history. Archive the listing instead.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_listing_deletion ON public.listings;
CREATE TRIGGER trg_prevent_protected_listing_deletion
  BEFORE DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_protected_listing_deletion();

ALTER FUNCTION public.prevent_protected_listing_deletion() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.prevent_protected_listing_deletion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_protected_listing_deletion() TO postgres, authenticated;

-- Direct Listing Publication Guard Trigger Function
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

-- Transactional Publication RPC: publish_listing(p_listing_id uuid)
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


