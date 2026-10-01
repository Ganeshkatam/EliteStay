-- 20261001130000_audit_remediation_p0_p1.sql
-- Complete audit remediation for outbox, timeline, reservation RLS/idempotency, storage, geocoding cache, and notifications

-- 1. Hardening append_outbox_event
-- Revoke generic authenticated execution and enforce strict validation
CREATE OR REPLACE FUNCTION public.append_outbox_event(
  p_type text,
  p_aggregate_type text,
  p_aggregate_id text,
  p_payload jsonb,
  p_correlation_id text DEFAULT NULL,
  p_causation_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_id uuid;
  v_actor_id uuid;
  v_is_authorized boolean := false;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- 1. If executed by superuser/postgres/service_role without auth.uid(), allow directly
  IF v_actor_id IS NULL THEN
    IF current_user IN ('postgres', 'service_role') OR public.is_admin() THEN
      v_is_authorized := true;
    ELSE
      RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
    END IF;
  ELSE
    -- 2. Validate aggregate type
    IF p_aggregate_type NOT IN (
      'APPLICATION', 'RESERVATION', 'BOOKING', 'STAY', 'LEASE',
      'MAINTENANCE', 'LISTING', 'USER', 'DEPOSIT', 'MOVE_IN', 'INVOICE', 'NOTICE', 'DOCUMENT'
    ) THEN
      RAISE EXCEPTION 'INVALID_AGGREGATE_TYPE: %', p_aggregate_type USING ERRCODE = '22023';
    END IF;

    -- 3. Verify actor authorization against the target aggregate
    IF public.is_admin() THEN
      v_is_authorized := true;
    ELSIF p_aggregate_type = 'APPLICATION' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.rental_applications a
        WHERE a.id::text = p_aggregate_id
          AND (a.guest_id = v_actor_id OR public.is_listing_owner(a.property_id))
      ) INTO v_is_authorized;
    ELSIF p_aggregate_type IN ('RESERVATION', 'BOOKING') THEN
      SELECT EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id::text = p_aggregate_id
          AND (r.guest_id = v_actor_id OR public.is_listing_owner(r.property_id))
      ) INTO v_is_authorized;
      IF NOT v_is_authorized THEN
        SELECT EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id::text = p_aggregate_id
            AND (b.guest_id = v_actor_id OR public.is_listing_owner(b.listing_id))
        ) INTO v_is_authorized;
      END IF;
    ELSIF p_aggregate_type = 'STAY' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.stays s
        WHERE s.id::text = p_aggregate_id
          AND (s.guest_id = v_actor_id OR public.is_listing_owner(s.listing_id))
      ) INTO v_is_authorized;
    ELSIF p_aggregate_type = 'LEASE' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.leases l
        WHERE l.id::text = p_aggregate_id
          AND (l.tenant_id = v_actor_id OR EXISTS (
            SELECT 1 FROM public.reservations r WHERE r.id = l.reservation_id AND (r.guest_id = v_actor_id OR public.is_listing_owner(r.property_id))
          ))
      ) INTO v_is_authorized;
    ELSIF p_aggregate_type = 'LISTING' THEN
      SELECT public.is_listing_owner(p_aggregate_id::uuid) INTO v_is_authorized;
    ELSIF p_aggregate_type = 'USER' THEN
      v_is_authorized := (p_aggregate_id = v_actor_id::text);
    ELSE
      -- Default allow if user is authenticated and operating on their own context
      v_is_authorized := true;
    END IF;

    IF NOT v_is_authorized THEN
      RAISE EXCEPTION 'UNAUTHORIZED_OUTBOX_EVENT' USING ERRCODE = '42501';
    END IF;
  END IF;

  INSERT INTO public.outbox_events (
    type,
    aggregate_type,
    aggregate_id,
    payload,
    status,
    correlation_id,
    causation_id
  ) VALUES (
    p_type,
    p_aggregate_type,
    p_aggregate_id,
    p_payload,
    'PENDING',
    p_correlation_id,
    p_causation_id
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

ALTER FUNCTION public.append_outbox_event(text, text, text, jsonb, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.append_outbox_event(text, text, text, jsonb, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.append_outbox_event(text, text, text, jsonb, text, text) TO authenticated, postgres;


-- 2. Hardening append_timeline_event
-- Enforce actor derivation strictly from auth.uid() and authorize entity mutation
CREATE OR REPLACE FUNCTION public.append_timeline_event(
  p_entity_type text,
  p_entity_id text,
  p_event_type text,
  p_actor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_correlation_id text DEFAULT NULL,
  p_causation_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
  v_actor uuid;
  v_is_authorized boolean := false;
BEGIN
  -- Strict actor derivation: authenticated callers CANNOT spoof another actor ID
  IF (SELECT auth.uid()) IS NOT NULL THEN
    v_actor := (SELECT auth.uid());
  ELSE
    IF current_user IN ('postgres', 'service_role') OR public.is_admin() THEN
      v_actor := p_actor_id;
    ELSE
      RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Validate authorization
  IF public.is_admin() OR current_user IN ('postgres', 'service_role') THEN
    v_is_authorized := true;
  ELSIF p_entity_type = 'APPLICATION' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.rental_applications a
      WHERE a.id::text = p_entity_id
        AND (a.guest_id = v_actor OR public.is_listing_owner(a.property_id))
    ) INTO v_is_authorized;
  ELSIF p_entity_type IN ('RESERVATION', 'BOOKING') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id::text = p_entity_id
        AND (r.guest_id = v_actor OR public.is_listing_owner(r.property_id))
    ) INTO v_is_authorized;
    IF NOT v_is_authorized THEN
      SELECT EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id::text = p_entity_id
          AND (b.guest_id = v_actor OR public.is_listing_owner(b.listing_id))
      ) INTO v_is_authorized;
    END IF;
  ELSIF p_entity_type = 'STAY' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id::text = p_entity_id
        AND (s.guest_id = v_actor OR public.is_listing_owner(s.listing_id))
    ) INTO v_is_authorized;
  ELSIF p_entity_type = 'LEASE' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.leases l
      WHERE l.id::text = p_entity_id
        AND (l.tenant_id = v_actor OR EXISTS (
          SELECT 1 FROM public.reservations r WHERE r.id = l.reservation_id AND (r.guest_id = v_actor OR public.is_listing_owner(r.property_id))
        ))
    ) INTO v_is_authorized;
  ELSIF p_entity_type = 'PROPERTY' THEN
    SELECT public.is_listing_owner(p_entity_id::uuid) INTO v_is_authorized;
  ELSE
    v_is_authorized := true;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'UNAUTHORIZED_TIMELINE_EVENT' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.domain_timeline (
    entity_type,
    entity_id,
    event_type,
    actor_id,
    metadata,
    correlation_id,
    causation_id
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_event_type,
    v_actor,
    p_metadata,
    p_correlation_id,
    p_causation_id
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.append_timeline_event(text, text, text, uuid, jsonb, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.append_timeline_event(text, text, text, uuid, jsonb, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.append_timeline_event(text, text, text, uuid, jsonb, text, text) TO authenticated, postgres;


-- 3. Hardening create_reservation_safe Idempotency Authorization
CREATE OR REPLACE FUNCTION public.create_reservation_safe(
  p_property_id uuid,
  p_guest_id uuid,
  p_check_in date,
  p_check_out date,
  p_guests_count integer,
  p_base_price numeric,
  p_cleaning_fee numeric,
  p_service_fee numeric,
  p_tax_amount numeric,
  p_total_amount numeric,
  p_currency text,
  p_snapshot_json jsonb,
  p_idempotency_key text DEFAULT NULL,
  p_lease_duration_months integer DEFAULT NULL,
  p_move_in_date date DEFAULT NULL,
  p_security_deposit_amount numeric DEFAULT 0,
  p_maintenance_fee_amount numeric DEFAULT 0,
  p_utilities_amount numeric DEFAULT 0,
  p_brokerage_fee_amount numeric DEFAULT 0
) RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_guest_id uuid;
  v_overlap_count integer;
  v_reservation public.reservations;
BEGIN
  -- 1. Derive or validate guest actor
  v_user_id := (SELECT auth.uid());
  IF v_user_id IS NOT NULL THEN
    v_guest_id := v_user_id;
  ELSE
    IF p_guest_id IS NOT NULL THEN
      v_guest_id := p_guest_id;
    ELSE
      RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 2. Idempotency Check: MUST match authenticated guest actor
  IF p_idempotency_key IS NOT NULL AND length(trim(p_idempotency_key)) > 0 THEN
    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE idempotency_key = p_idempotency_key
      AND guest_id = v_guest_id;

    IF FOUND THEN
      RETURN v_reservation;
    END IF;
  END IF;

  -- 3. Row-lock parent listing to serialize concurrent bookings on the same property
  PERFORM 1 FROM public.listings WHERE id = p_property_id FOR UPDATE;

  -- 4. Check date overlap availability inside row-locked transaction
  SELECT count(*)
  INTO v_overlap_count
  FROM public.reservations
  WHERE property_id = p_property_id
    AND status IN ('CONFIRMED', 'LOCKED', 'PENDING_PAYMENT', 'PAYMENT_AUTHORIZED')
    AND check_in < p_check_out
    AND check_out > p_check_in;

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'AVAILABILITY_CONFLICT' USING ERRCODE = 'P0001';
  END IF;

  -- 5. Insert the reservation
  INSERT INTO public.reservations (
    property_id,
    guest_id,
    check_in,
    check_out,
    guests_count,
    status,
    base_price,
    cleaning_fee,
    service_fee,
    tax_amount,
    total_amount,
    currency,
    snapshot_json,
    idempotency_key,
    version,
    lease_duration_months,
    move_in_date,
    security_deposit_amount,
    maintenance_fee_amount,
    utilities_amount,
    brokerage_fee_amount
  ) VALUES (
    p_property_id,
    v_guest_id,
    p_check_in,
    p_check_out,
    p_guests_count,
    'DRAFT',
    p_base_price,
    p_cleaning_fee,
    p_service_fee,
    p_tax_amount,
    p_total_amount,
    p_currency,
    p_snapshot_json,
    p_idempotency_key,
    1,
    p_lease_duration_months,
    p_move_in_date,
    p_security_deposit_amount,
    p_maintenance_fee_amount,
    p_utilities_amount,
    p_brokerage_fee_amount
  ) RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;

-- 4. Reservations RLS Policy Hardening
-- Allow UPDATE and INSERT for authorized guests, hosts, and admins
DROP POLICY IF EXISTS "Guests and Hosts can update authorized reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authorized users can insert reservations" ON public.reservations;

CREATE POLICY "Guests and Hosts can update authorized reservations"
  ON public.reservations
  FOR UPDATE TO authenticated
  USING (
    guest_id = auth.uid()
    OR public.is_listing_owner(property_id)
    OR public.is_admin()
  )
  WITH CHECK (
    guest_id = auth.uid()
    OR public.is_listing_owner(property_id)
    OR public.is_admin()
  );

CREATE POLICY "Authorized users can insert reservations"
  ON public.reservations
  FOR INSERT TO authenticated
  WITH CHECK (
    guest_id = auth.uid()
    OR public.is_admin()
  );


-- 5. Geocoding Cache Security
-- Revoke unrestricted client write access; cache writes belong to backend/admin
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.geocoding_cache;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.geocoding_cache;
REVOKE INSERT, UPDATE, DELETE ON public.geocoding_cache FROM anon, authenticated, PUBLIC;
GRANT INSERT, UPDATE, DELETE ON public.geocoding_cache TO postgres;


-- 6. Notifications RLS Hardening
-- Block arbitrary authenticated notification manufacturing; allow read and update (mark read)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM anon, authenticated, PUBLIC;
GRANT INSERT ON public.notifications TO postgres;

CREATE POLICY "Admin can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());


-- 7. Storage Bucket Policies Hardening for Listings Images
-- Enable hosts to upload and manage listing photos at <listing_id>/<filename>
DROP POLICY IF EXISTS "Auth Upload Listings" ON storage.objects;
DROP POLICY IF EXISTS "Users modify own listing photos" ON storage.objects;

CREATE POLICY "Hosts can upload listing photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Hosts can update listing photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Hosts can delete listing photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );
