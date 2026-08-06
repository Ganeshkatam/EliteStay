-- Phase 4.0: Long-Term Rental Foundation

-- 1. Enum for Booking Policy
CREATE TYPE public.listing_booking_policy AS ENUM (
  'INSTANT_RESERVATION',
  'RENTAL_APPLICATION',
  'VIEWING_REQUEST',
  'CONTACT_HOST'
);

-- 2. Update Listings Table with Long-Term Leasing Fields
ALTER TABLE public.listings
  ADD COLUMN booking_policy public.listing_booking_policy DEFAULT 'RENTAL_APPLICATION',
  ADD COLUMN minimum_lease_months INTEGER DEFAULT 1,
  ADD COLUMN maximum_lease_months INTEGER,
  ADD COLUMN notice_period_days INTEGER DEFAULT 30;

-- Rename available_date to available_from to match long-term leasing terminology
ALTER TABLE public.listings RENAME COLUMN available_date TO available_from;

-- 3. Expand Reservations Table for StayReservation
ALTER TABLE public.reservations
  ADD COLUMN lease_duration_months INTEGER,
  ADD COLUMN move_in_date DATE,
  ADD COLUMN security_deposit_amount NUMERIC DEFAULT 0,
  ADD COLUMN maintenance_fee_amount NUMERIC DEFAULT 0,
  ADD COLUMN utilities_amount NUMERIC DEFAULT 0,
  ADD COLUMN brokerage_fee_amount NUMERIC DEFAULT 0;

-- 4. Create Rental Application Aggregate
CREATE TYPE public.rental_application_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED'
);

CREATE TABLE public.rental_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.listings(id),
  guest_id UUID NOT NULL REFERENCES auth.users(id),
  status public.rental_application_status NOT NULL DEFAULT 'DRAFT',
  move_in_date DATE NOT NULL,
  lease_duration_months INTEGER NOT NULL,
  monthly_budget NUMERIC,
  employment_status TEXT,
  student_status TEXT,
  income_range TEXT,
  pet_information TEXT,
  guarantor_information TEXT,
  smoking_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- Policies for rental_applications
CREATE POLICY "Guests can manage their own rental applications" ON public.rental_applications FOR ALL USING (auth.uid() = guest_id);
CREATE POLICY "Hosts can view applications for their properties" ON public.rental_applications FOR SELECT USING (property_id IN (SELECT id FROM public.listings WHERE host_id = auth.uid()));
CREATE POLICY "Hosts can update applications for their properties" ON public.rental_applications FOR UPDATE USING (property_id IN (SELECT id FROM public.listings WHERE host_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER rental_applications_updated_at
  BEFORE UPDATE ON public.rental_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Update RPC to accept long-term fields
CREATE OR REPLACE FUNCTION public.create_reservation_safe(
  p_property_id uuid, p_guest_id uuid, p_check_in date, p_check_out date,
  p_guests_count integer, p_base_price numeric, p_cleaning_fee numeric,
  p_service_fee numeric, p_tax_amount numeric, p_total_amount numeric,
  p_currency text, p_snapshot_json jsonb, p_idempotency_key text,
  p_lease_duration_months integer DEFAULT NULL,
  p_move_in_date date DEFAULT NULL,
  p_security_deposit_amount numeric DEFAULT 0,
  p_maintenance_fee_amount numeric DEFAULT 0,
  p_utilities_amount numeric DEFAULT 0,
  p_brokerage_fee_amount numeric DEFAULT 0
)
 RETURNS reservations
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_overlap_count integer;
  v_reservation public.reservations;
BEGIN
  -- 1. Check availability with a table-level or row-level lock equivalent 
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
    version,
    lease_duration_months,
    move_in_date,
    security_deposit_amount,
    maintenance_fee_amount,
    utilities_amount,
    brokerage_fee_amount
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
$function$
