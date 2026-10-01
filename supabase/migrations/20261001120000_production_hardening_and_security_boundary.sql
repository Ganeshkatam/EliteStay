-- 20261001120000_production_hardening_and_security_boundary.sql
-- Production hardening for outbox, timeline, booking concurrency, and actor boundaries

-- 1. Hardening outbox_events table & RPC
REVOKE INSERT, UPDATE, DELETE ON public.outbox_events FROM anon, authenticated, PUBLIC;
DROP POLICY IF EXISTS "Users can insert outbox events" ON public.outbox_events;

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
BEGIN
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

-- 2. Hardening domain_timeline table & RLS
REVOKE INSERT, UPDATE, DELETE ON public.domain_timeline FROM anon, authenticated, PUBLIC;
DROP POLICY IF EXISTS "Users can read timeline" ON public.domain_timeline;
DROP POLICY IF EXISTS "Users can insert timeline" ON public.domain_timeline;
DROP POLICY IF EXISTS "Users can read authorized timeline" ON public.domain_timeline;

CREATE POLICY "Users can read authorized timeline" ON public.domain_timeline
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR actor_id = auth.uid()
  OR (
    entity_type = 'APPLICATION' AND EXISTS (
      SELECT 1 FROM public.rental_applications a
      WHERE a.id::text = domain_timeline.entity_id
      AND (a.guest_id = auth.uid() OR public.is_listing_owner(a.property_id))
    )
  )
  OR (
    entity_type = 'LEASE' AND EXISTS (
      SELECT 1 FROM public.leases l
      WHERE l.id::text = domain_timeline.entity_id
      AND (l.tenant_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.reservations r WHERE r.id = l.reservation_id AND (r.guest_id = auth.uid() OR public.is_listing_owner(r.property_id))
      ))
    )
  )
  OR (
    entity_type = 'BOOKING' AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id::text = domain_timeline.entity_id
      AND (b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id))
    )
  )
  OR (
    entity_type = 'STAY' AND EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id::text = domain_timeline.entity_id
      AND (s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id))
    )
  )
  OR (
    entity_type = 'PROPERTY' AND public.is_listing_owner(entity_id::uuid)
  )
);

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
BEGIN
  v_actor := COALESCE(p_actor_id, auth.uid());
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

-- 3. Hardening transition_booking actor derivation & authorization
CREATE OR REPLACE FUNCTION public.transition_booking(
  p_booking_id uuid,
  p_current_status public.booking_status,
  p_new_status public.booking_status,
  p_actor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_actor_id uuid;
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    IF p_actor_id IS NOT NULL AND public.is_admin() THEN
      v_actor_id := p_actor_id;
    ELSE
      RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF NOT (v_booking.guest_id = v_actor_id OR public.is_listing_owner(v_booking.listing_id) OR public.is_admin()) THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '42501';
  END IF;

  IF v_booking.status != p_current_status THEN
    RAISE EXCEPTION 'Booking state changed by another process (expected %, got %)', p_current_status, v_booking.status;
  END IF;

  UPDATE public.bookings
  SET status = p_new_status
  WHERE id = p_booking_id;

  INSERT INTO public.booking_events (
    booking_id,
    action,
    actor_id,
    previous_status,
    new_status,
    metadata
  ) VALUES (
    p_booking_id,
    p_new_status::text,
    v_actor_id,
    p_current_status,
    p_new_status,
    p_metadata
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. Hardening transition_stay actor derivation & authorization
CREATE OR REPLACE FUNCTION public.transition_stay(
  p_stay_id uuid,
  p_current_status public.stay_status,
  p_new_status public.stay_status,
  p_actor_id uuid DEFAULT NULL,
  p_updates jsonb DEFAULT '{}'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay public.stays%ROWTYPE;
  v_actor_id uuid;
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    IF p_actor_id IS NOT NULL AND public.is_admin() THEN
      v_actor_id := p_actor_id;
    ELSE
      RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT * INTO v_stay
  FROM public.stays
  WHERE id = p_stay_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stay not found';
  END IF;

  IF NOT (v_stay.guest_id = v_actor_id OR public.is_listing_owner(v_stay.listing_id) OR public.is_admin()) THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '42501';
  END IF;

  IF v_stay.status != p_current_status THEN
    RAISE EXCEPTION 'Stay state changed by another process (expected %, got %)', p_current_status, v_stay.status;
  END IF;

  UPDATE public.stays
  SET 
    status = p_new_status,
    actual_move_in_date = COALESCE((p_updates->>'actual_move_in_date')::date, actual_move_in_date),
    actual_move_out_date = COALESCE((p_updates->>'actual_move_out_date')::date, actual_move_out_date)
  WHERE id = p_stay_id;

  INSERT INTO public.stay_events (
    stay_id,
    action,
    actor_id,
    previous_status,
    new_status,
    metadata
  ) VALUES (
    p_stay_id,
    p_new_status::text,
    v_actor_id,
    p_current_status,
    p_new_status,
    p_metadata
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 5. Hardening create_reservation_safe locking, actor validation, & idempotency
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

  -- 2. Idempotency Check: Return existing reservation if already created
  IF p_idempotency_key IS NOT NULL AND length(trim(p_idempotency_key)) > 0 THEN
    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE idempotency_key = p_idempotency_key;

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

ALTER FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) TO authenticated;
