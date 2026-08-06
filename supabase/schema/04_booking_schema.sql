-- 04_booking_schema.sql
-- Booking domain tables and types

-- Create reservation status enum
CREATE TYPE reservation_status AS ENUM (
  'DRAFT',
  'VALIDATING',
  'VALIDATED',
  'LOCKED',
  'PENDING_PAYMENT',
  'PAYMENT_AUTHORIZED',
  'CONFIRMED',
  'FAILED',
  'VALIDATION_FAILED',
  'PAYMENT_FAILED',
  'LOCK_EXPIRED',
  'BOOKING_EXPIRED',
  'SYSTEM_ERROR',
  'CANCELLED',
  'REFUNDED'
);

-- Reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  guest_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Stay details
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests_count integer NOT NULL CHECK (guests_count > 0),
  
  -- State Machine
  status reservation_status NOT NULL DEFAULT 'DRAFT',
  
  -- Hybrid Pricing Snapshot
  base_price numeric(10, 2) NOT NULL,
  cleaning_fee numeric(10, 2) NOT NULL DEFAULT 0,
  service_fee numeric(10, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(10, 2) NOT NULL DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  currency text NOT NULL,
  snapshot_json jsonb NOT NULL,
  
  -- Payment
  payment_intent_id text,
  
  -- Optimistic Concurrency & Idempotency
  version integer NOT NULL DEFAULT 1,
  idempotency_key text UNIQUE,
  
  -- Audit
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT valid_dates CHECK (check_in < check_out)
);

-- Create overlap check function (can be used directly or translated to RPC)
-- This enforces that for a given property, there are no overlapping confirmed or pending reservations.
CREATE OR REPLACE FUNCTION public.check_availability(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overlap_count integer;
BEGIN
  SELECT count(*)
  INTO overlap_count
  FROM public.reservations
  WHERE property_id = p_property_id
    AND status IN ('CONFIRMED', 'LOCKED', 'PENDING_PAYMENT', 'PAYMENT_AUTHORIZED')
    AND check_in < p_check_out
    AND check_out > p_check_in;
    
  RETURN overlap_count = 0;
END;
$$;

-- RLS Policies
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Guests can read their own reservations
CREATE POLICY "Guests can view own reservations"
  ON public.reservations
  FOR SELECT
  USING (auth.uid() = guest_id);

-- Hosts can read reservations for their properties
CREATE POLICY "Hosts can view property reservations"
  ON public.reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = reservations.property_id
        AND listings.host_id = auth.uid()
    )
  );

-- Service Role (Server Actions) handles inserts/updates, bypassing RLS
