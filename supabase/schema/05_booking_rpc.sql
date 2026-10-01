-- 05_booking_rpc.sql
-- Transactional Reservation Creation

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

  -- 2. Idempotency Check: Return existing reservation if already created by this guest
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

ALTER FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_reservation_safe(uuid, uuid, date, date, integer, numeric, numeric, numeric, numeric, numeric, text, jsonb, text, integer, date, numeric, numeric, numeric, numeric) TO authenticated;

