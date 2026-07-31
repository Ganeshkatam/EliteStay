/*
==================================================
Domain: Stays
Purpose: Track actual tenancy or active bookings.
Contains: 
- stays
- triggers
- RLS
==================================================
*/

CREATE TABLE public.stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    created_from_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expected_move_in_date DATE NOT NULL,
    actual_move_in_date DATE,
    expected_move_out_date DATE NOT NULL,
    actual_move_out_date DATE,
    agreed_amount NUMERIC(12, 2) NOT NULL,
    agreed_billing_period public.billing_period NOT NULL,
    security_deposit_paid NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    status public.stay_status DEFAULT 'upcoming'::public.stay_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER stays_updated_at 
  BEFORE UPDATE ON public.stays 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own stays" ON public.stays
  FOR SELECT USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can view stays for their listings" ON public.stays
  FOR SELECT USING (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE POLICY "Hosts can manage stays" ON public.stays
  FOR ALL USING (public.is_listing_owner(listing_id) OR public.is_admin());
