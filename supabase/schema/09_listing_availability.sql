/*
==================================================
Domain: Listing Availability
Purpose: Tracks property availability periods, occupancies, and host blocks.
Contains: 
- listing_availability
- triggers, RLS, & range indexes
==================================================
*/

CREATE TABLE public.listing_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    available_units INTEGER DEFAULT 1 NOT NULL,
    status public.availability_status DEFAULT 'available'::public.availability_status NOT NULL,
    source public.availability_source DEFAULT 'manual_block'::public.availability_source NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_availability_dates CHECK (end_date >= start_date)
);

-- Composite index for date range availability searches
CREATE INDEX IF NOT EXISTS idx_listing_availability_range ON public.listing_availability (listing_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_listing_availability_status ON public.listing_availability (status);

CREATE TRIGGER listing_availability_updated_at 
  BEFORE UPDATE ON public.listing_availability 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view availability" ON public.listing_availability
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage availability" ON public.listing_availability
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_availability.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );
