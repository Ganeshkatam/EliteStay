/*
==================================================
Domain: Availability
Purpose: Tracks listing availability dates and host blocks.
Contains: 
- listing_availability
- RLS
==================================================
*/

CREATE TABLE public.listing_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    available_from DATE NOT NULL,
    available_units INTEGER DEFAULT 1 NOT NULL,
    status public.availability_status DEFAULT 'available'::public.availability_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER listing_availability_updated_at 
  BEFORE UPDATE ON public.listing_availability 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;

-- Availability RLS
CREATE POLICY "Public can view availability" ON public.listing_availability
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage availability" ON public.listing_availability
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_availability.listing_id 
        AND l.host_id = auth.uid()
    )
  );
