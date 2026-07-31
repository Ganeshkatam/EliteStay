/*
==================================================
Domain: Bookings
Purpose: Booking lifecycle and requests.
Contains: 
- bookings
- booking_events
- triggers
- RLS
==================================================
*/

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    requested_move_in DATE NOT NULL,
    requested_duration INTEGER NOT NULL,
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

CREATE TABLE public.booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER bookings_updated_at 
  BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;

-- Bookings RLS
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

-- Booking Events RLS
CREATE POLICY "Guests can view own booking events" ON public.booking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_events.booking_id 
      AND b.guest_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Hosts can view booking events for their listings" ON public.booking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_events.booking_id 
      AND public.is_listing_owner(b.listing_id)
    ) OR public.is_admin()
  );

CREATE POLICY "Actors can insert booking events" ON public.booking_events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND actor_id = auth.uid()
  );
