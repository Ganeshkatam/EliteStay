/*
==================================================
Domain: Bookings
Purpose: Booking request lifecycle, financial term snapshots, and domain events.
Contains: 
- bookings
- booking_events
- transition_booking atomic RPC
- triggers, RLS, & composite indexes
==================================================
*/

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    requested_move_in DATE NOT NULL,
    requested_duration INTEGER NOT NULL CHECK (requested_duration > 0),
    message TEXT,
    snapshot_monthly_rent NUMERIC(12, 2) NOT NULL,
    snapshot_security_deposit NUMERIC(12, 2) NOT NULL,
    snapshot_maintenance_fee NUMERIC(12, 2) NOT NULL,
    snapshot_billing_period public.billing_period NOT NULL,
    snapshot_minimum_stay INTEGER NOT NULL,
    expires_at TIMESTAMPTZ,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_status ON public.bookings(guest_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_status ON public.bookings(listing_id, status);

CREATE TABLE public.booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    previous_status public.booking_status,
    new_status public.booking_status,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id ON public.booking_events(booking_id);

CREATE TRIGGER bookings_updated_at 
  BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;

-- Bookings RLS Policies
CREATE POLICY "Guests can view own bookings" ON public.bookings
  FOR SELECT USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can view bookings for their listings" ON public.bookings
  FOR SELECT USING (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND guest_id = auth.uid()
  );

CREATE POLICY "Guests can cancel pending bookings" ON public.bookings
  FOR UPDATE USING (guest_id = auth.uid() AND status = 'pending'::public.booking_status)
  WITH CHECK (guest_id = auth.uid() AND status = 'cancelled'::public.booking_status);

CREATE POLICY "Hosts can approve or reject pending bookings" ON public.bookings
  FOR UPDATE USING (public.is_listing_owner(listing_id) AND status = 'pending'::public.booking_status)
  WITH CHECK (public.is_listing_owner(listing_id) AND status IN ('approved'::public.booking_status, 'rejected'::public.booking_status));

CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (public.is_admin());

-- Booking Events RLS Policies
CREATE POLICY "Users can view events for their bookings" ON public.booking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_events.booking_id
      AND (b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert events for their bookings" ON public.booking_events
  FOR INSERT WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_events.booking_id
      AND (b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR public.is_admin())
    )
  );

-- Atomic booking transition RPC
CREATE OR REPLACE FUNCTION public.transition_booking(
  p_booking_id uuid,
  p_current_status public.booking_status,
  p_new_status public.booking_status,
  p_actor_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status != p_current_status THEN
    RAISE EXCEPTION 'Booking state changed by another process (expected %, got %)', p_current_status, v_booking.status;
  END IF;

  -- Update booking status
  UPDATE public.bookings
  SET status = p_new_status
  WHERE id = p_booking_id;

  -- Insert audit domain event
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
    p_actor_id,
    p_current_status,
    p_new_status,
    p_metadata
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Explicit Deterministic Dual Listing Locker
CREATE OR REPLACE FUNCTION public.acquire_listing_locks_ordered(
  p_listing_a uuid,
  p_listing_b uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first uuid;
  v_second uuid;
BEGIN
  IF p_listing_a IS NULL AND p_listing_b IS NULL THEN
    RETURN;
  ELSIF p_listing_a IS NULL THEN
    PERFORM 1 FROM public.listings WHERE id = p_listing_b FOR UPDATE;
    RETURN;
  ELSIF p_listing_b IS NULL OR p_listing_a = p_listing_b THEN
    PERFORM 1 FROM public.listings WHERE id = p_listing_a FOR UPDATE;
    RETURN;
  END IF;

  v_first := LEAST(p_listing_a, p_listing_b);
  v_second := GREATEST(p_listing_a, p_listing_b);

  PERFORM 1 FROM public.listings WHERE id = v_first FOR UPDATE;
  PERFORM 1 FROM public.listings WHERE id = v_second FOR UPDATE;
END;
$$;

-- Bookings Lock Trigger
CREATE OR REPLACE FUNCTION public.lock_parent_listing_for_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.listing_id IS DISTINCT FROM NEW.listing_id THEN
      PERFORM public.acquire_listing_locks_ordered(OLD.listing_id, NEW.listing_id);
    ELSIF NEW.status IN ('pending', 'approved') AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('pending', 'approved') THEN
      PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_parent_listing_for_booking ON public.bookings;
CREATE TRIGGER trg_lock_parent_listing_for_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_parent_listing_for_booking();

ALTER FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) OWNER TO postgres;
ALTER FUNCTION public.lock_parent_listing_for_booking() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lock_parent_listing_for_booking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.lock_parent_listing_for_booking() TO postgres, authenticated;

