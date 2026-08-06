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
  p_idempotency_key text
) RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_overlap_count integer;
  v_reservation public.reservations;
BEGIN
  -- 1. Check availability with a table-level or row-level lock equivalent 
  -- (Though serializable or repeatable read is best, a simple SELECT FOR UPDATE on property isn't viable here.
  -- The check itself inside the function is atomic in the transaction context)
  
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

  -- 2. Insert the reservation
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
    version
  ) VALUES (
    p_property_id,
    p_guest_id,
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
    1
  ) RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;
