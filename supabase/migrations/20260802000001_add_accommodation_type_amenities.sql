-- 1. Create accommodation_type_amenities table
CREATE TABLE IF NOT EXISTS public.accommodation_type_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE CASCADE NOT NULL,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    is_required BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    category VARCHAR(50) DEFAULT 'Basic' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uk_accomm_type_amenity UNIQUE(accommodation_type_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_accomm_type_amenities_type_id ON public.accommodation_type_amenities(accommodation_type_id);
CREATE INDEX IF NOT EXISTS idx_accomm_type_amenities_amenity_id ON public.accommodation_type_amenities(amenity_id);

ALTER TABLE public.accommodation_type_amenities ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS accommodation_type_amenities_updated_at ON public.accommodation_type_amenities;
CREATE TRIGGER accommodation_type_amenities_updated_at 
  BEFORE UPDATE ON public.accommodation_type_amenities 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP POLICY IF EXISTS "Public can view accommodation type amenities" ON public.accommodation_type_amenities;
CREATE POLICY "Public can view accommodation type amenities" ON public.accommodation_type_amenities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage accommodation type amenities" ON public.accommodation_type_amenities;
CREATE POLICY "Admins can manage accommodation type amenities" ON public.accommodation_type_amenities
  FOR ALL USING (public.is_admin());

-- 2. Ensure comprehensive master catalog of amenities exists
-- INSERT INTO public.amenities (id, name, icon) VALUES
--   (gen_random_uuid(), 'WiFi', 'wifi'),
--   (gen_random_uuid(), 'Parking', 'parking'),
--   (gen_random_uuid(), 'Kitchen', 'kitchen'),
--   (gen_random_uuid(), 'Laundry', 'shirt'),
--   (gen_random_uuid(), 'Power Backup', 'zap'),
--   (gen_random_uuid(), 'CCTV', 'shield'),
--   (gen_random_uuid(), 'Meals', 'utensils'),
--   (gen_random_uuid(), 'RO Water', 'droplets'),
--   (gen_random_uuid(), 'Housekeeping', 'sparkles'),
--   (gen_random_uuid(), 'Common Room', 'users'),
--   (gen_random_uuid(), 'Study Area', 'book-open'),
--   (gen_random_uuid(), 'Mess', 'utensils'),
--   (gen_random_uuid(), 'Lockers', 'lock'),
--   (gen_random_uuid(), 'Reception', 'user-check'),
--   (gen_random_uuid(), 'Gym', 'dumbbell'),
--   (gen_random_uuid(), 'Pool', 'waves'),
--   (gen_random_uuid(), 'Lift', 'arrow-up-down'),
--   (gen_random_uuid(), 'Balcony', 'sun'),
--   (gen_random_uuid(), 'Security', 'shield-check'),
--   (gen_random_uuid(), 'Garden', 'trees'),
--   (gen_random_uuid(), 'Private Parking', 'car'),
--   (gen_random_uuid(), 'Terrace', 'sun'),
--   (gen_random_uuid(), 'Pet Friendly', 'heart'),
--   (gen_random_uuid(), 'BBQ Area', 'flame'),
--   (gen_random_uuid(), 'Refrigerator', 'refrigerator'),
--   (gen_random_uuid(), 'Microwave', 'microwave'),
--   (gen_random_uuid(), 'Gas Stove', 'flame'),
--   (gen_random_uuid(), 'Bed', 'bed'),
--   (gen_random_uuid(), 'Wardrobe', 'archive'),
--   (gen_random_uuid(), 'Study Table', 'table'),
--   (gen_random_uuid(), 'Fire Alarm', 'bell'),
--   (gen_random_uuid(), 'Wheelchair Access', 'accessibility')
-- ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;

-- 3. Populate accommodation_type_amenities mappings for PG
INSERT INTO public.accommodation_type_amenities (accommodation_type_id, amenity_id, is_default, is_required, display_order, category)
SELECT t.id, a.id, 
       CASE WHEN a.name IN ('WiFi', 'Power Backup', 'Water', 'RO Water', 'Security', 'CCTV') THEN true ELSE false END as is_default,
       CASE WHEN a.name IN ('WiFi', 'Water') THEN true ELSE false END as is_required,
       10 as display_order,
       CASE 
         WHEN a.name IN ('WiFi') THEN 'Internet'
         WHEN a.name IN ('Meals', 'Kitchen', 'RO Water', 'Refrigerator', 'Microwave') THEN 'Kitchen'
         WHEN a.name IN ('Laundry', 'Housekeeping') THEN 'Services'
         WHEN a.name IN ('CCTV', 'Security') THEN 'Safety'
         WHEN a.name IN ('Power Backup', 'Parking') THEN 'Utilities'
         ELSE 'Basic'
       END as category
FROM public.accommodation_types t, public.amenities a
WHERE t.name = 'PG' AND a.name IN ('WiFi', 'Parking', 'Kitchen', 'Laundry', 'Power Backup', 'CCTV', 'Meals', 'RO Water', 'Housekeeping')
ON CONFLICT (accommodation_type_id, amenity_id) DO UPDATE 
SET is_default = EXCLUDED.is_default, category = EXCLUDED.category;

-- 4. Populate mappings for Hostel
INSERT INTO public.accommodation_type_amenities (accommodation_type_id, amenity_id, is_default, is_required, display_order, category)
SELECT t.id, a.id, 
       CASE WHEN a.name IN ('WiFi', 'Lockers', 'CCTV', 'Mess') THEN true ELSE false END as is_default,
       CASE WHEN a.name IN ('WiFi', 'Lockers') THEN true ELSE false END as is_required,
       20 as display_order,
       CASE 
         WHEN a.name IN ('WiFi') THEN 'Internet'
         WHEN a.name IN ('Mess') THEN 'Services'
         WHEN a.name IN ('Common Room', 'Study Area') THEN 'Facilities'
         WHEN a.name IN ('CCTV', 'Lockers', 'Reception') THEN 'Safety'
         WHEN a.name IN ('Laundry') THEN 'Services'
         ELSE 'Basic'
       END as category
FROM public.accommodation_types t, public.amenities a
WHERE t.name = 'Hostel' AND a.name IN ('WiFi', 'Common Room', 'Laundry', 'Study Area', 'Mess', 'CCTV', 'Lockers', 'Reception')
ON CONFLICT (accommodation_type_id, amenity_id) DO UPDATE 
SET is_default = EXCLUDED.is_default, category = EXCLUDED.category;

-- 5. Populate mappings for Apartment
INSERT INTO public.accommodation_type_amenities (accommodation_type_id, amenity_id, is_default, is_required, display_order, category)
SELECT t.id, a.id, 
       CASE WHEN a.name IN ('Kitchen', 'Balcony', 'Lift', 'Power Backup') THEN true ELSE false END as is_default,
       CASE WHEN a.name IN ('Power Backup') THEN true ELSE false END as is_required,
       30 as display_order,
       CASE 
         WHEN a.name IN ('Kitchen') THEN 'Kitchen'
         WHEN a.name IN ('Parking', 'Lift', 'Power Backup') THEN 'Utilities'
         WHEN a.name IN ('Gym', 'Pool') THEN 'Recreation'
         WHEN a.name IN ('Balcony') THEN 'Outdoor'
         WHEN a.name IN ('Security') THEN 'Safety'
         ELSE 'Basic'
       END as category
FROM public.accommodation_types t, public.amenities a
WHERE t.name = 'Apartment' AND a.name IN ('Parking', 'Gym', 'Pool', 'Lift', 'Power Backup', 'Balcony', 'Security', 'Kitchen')
ON CONFLICT (accommodation_type_id, amenity_id) DO UPDATE 
SET is_default = EXCLUDED.is_default, category = EXCLUDED.category;

-- 6. Populate mappings for Villa
INSERT INTO public.accommodation_type_amenities (accommodation_type_id, amenity_id, is_default, is_required, display_order, category)
SELECT t.id, a.id, 
       CASE WHEN a.name IN ('Garden', 'Private Parking', 'Kitchen', 'Terrace') THEN true ELSE false END as is_default,
       CASE WHEN a.name IN ('Private Parking') THEN true ELSE false END as is_required,
       40 as display_order,
       CASE 
         WHEN a.name IN ('Kitchen') THEN 'Kitchen'
         WHEN a.name IN ('Garden', 'Terrace', 'BBQ Area') THEN 'Outdoor'
         WHEN a.name IN ('Private Parking') THEN 'Utilities'
         WHEN a.name IN ('Swimming Pool', 'Pool') THEN 'Recreation'
         WHEN a.name IN ('Pet Friendly') THEN 'Facilities'
         ELSE 'Basic'
       END as category
FROM public.accommodation_types t, public.amenities a
WHERE t.name = 'Villa' AND a.name IN ('Garden', 'Private Parking', 'Swimming Pool', 'Pool', 'Kitchen', 'Terrace', 'Pet Friendly', 'BBQ Area')
ON CONFLICT (accommodation_type_id, amenity_id) DO UPDATE 
SET is_default = EXCLUDED.is_default, category = EXCLUDED.category;
