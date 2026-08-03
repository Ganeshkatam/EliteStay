-- Migration: Add Host Primary Accommodation Specialization & Enforcement
-- Purpose: Enforces that each hosting entity operates exclusively one kind of living accommodation type (Hostel, PG, Home/Apartment, or Other) without duplicating enums.

-- 1. Ensure canonical 'other' category exists in public.accommodation_types for specialized residences
INSERT INTO public.accommodation_types (id, name, slug, description, icon, display_order, is_active)
SELECT 
  gen_random_uuid(), 
  'Other Residence', 
  'other', 
  'Specialized residential living facilities and unique accommodations', 
  'home', 
  110, 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.accommodation_types WHERE slug = 'other');

-- 2. Add primary_accommodation_type_id foreign key reference to public.host_profiles
ALTER TABLE public.host_profiles
ADD COLUMN IF NOT EXISTS primary_accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_host_profiles_accommodation_type ON public.host_profiles(primary_accommodation_type_id);

-- 3. Database enforcement function & trigger to preserve invariant during listing creation & updates
CREATE OR REPLACE FUNCTION public.enforce_host_accommodation_specialization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host_specialization_id UUID;
BEGIN
  -- Retrieve host primary specialization
  SELECT primary_accommodation_type_id INTO v_host_specialization_id
  FROM public.host_profiles
  WHERE user_id = NEW.host_id;

  IF v_host_specialization_id IS NOT NULL THEN
    -- Automatically inherit specialization if not provided
    IF NEW.accommodation_type_id IS NULL THEN
      NEW.accommodation_type_id := v_host_specialization_id;
    ELSIF NEW.accommodation_type_id <> v_host_specialization_id THEN
      RAISE EXCEPTION 'Host Specialization Rule Violation: Listing accommodation_type_id (%) does not match Host Profile primary_accommodation_type_id (%). Hosts are strictly limited to one accommodation specialization.', NEW.accommodation_type_id, v_host_specialization_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_host_specialization ON public.listings;
CREATE TRIGGER trg_enforce_host_specialization
  BEFORE INSERT OR UPDATE OF accommodation_type_id ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_host_accommodation_specialization();
