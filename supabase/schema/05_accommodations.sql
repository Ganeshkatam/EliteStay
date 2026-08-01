/*
==================================================
Domain: Accommodations Reference
Purpose: Master entities describing property types and available amenities.
Contains: 
- accommodation_types
- amenities
- triggers & RLS policies
==================================================
*/

CREATE TABLE public.accommodation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.accommodation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER accommodation_types_updated_at 
  BEFORE UPDATE ON public.accommodation_types 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER amenities_updated_at 
  BEFORE UPDATE ON public.amenities 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Policies
CREATE POLICY "Public can view accommodation types" ON public.accommodation_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage accommodation types" ON public.accommodation_types
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view amenities" ON public.amenities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage amenities" ON public.amenities
  FOR ALL USING (public.is_admin());
