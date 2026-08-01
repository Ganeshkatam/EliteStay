-- Insert Accommodation Types
INSERT INTO public.accommodation_types (id, name, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PG', 'Paying Guest accommodation'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hostel', 'Shared hostel accommodation'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Apartment', 'Standard residential apartment'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Independent House', 'Standalone house or bungalow'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Villa', 'Luxury standalone villa'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Private Room', 'Private room within a shared property'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Shared Room', 'Shared room with other occupants'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Service Apartment', 'Furnished apartment with hotel-like services'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Co-living', 'Modern managed shared living spaces');

-- Insert Amenities (Categorized conceptually, stored flat)
-- Essentials
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Wi-Fi', 'wifi'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'Electricity', 'zap'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'Water', 'droplets');
-- Comfort
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14', 'AC', 'snowflake'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15', 'Geyser', 'thermometer'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16', 'Refrigerator', 'refrigerator');
-- Services
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b17', 'Laundry', 'shirt'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b18', 'Housekeeping', 'broom'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b19', 'Meals', 'utensils');
-- Security
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b20', 'CCTV', 'camera'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 'Security Guard', 'shield'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Biometric Entry', 'fingerprint');
-- Parking
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23', 'Bike Parking', 'bike'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b24', 'Car Parking', 'car');

-- Seed Listings
WITH test_host AS (
  SELECT id FROM public.profiles LIMIT 1
)
INSERT INTO public.listings (
  id, host_id, accommodation_type_id, title, description,
  country_code, country, state, city, locality, postal_code, latitude, longitude, formatted_address,
  status, public_id, furnishing, gender_preference, occupancy_type
) VALUES
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- PG
  'Premium Boys PG in HSR Layout', 'Spacious shared rooms with all amenities included.',
  'IN', 'India', 'Karnataka', 'Bangalore', 'HSR Layout', '560102', 12.9081, 77.6476, 'HSR Layout Sector 2, Bangalore, Karnataka',
  'published', 'lst_pg_hsr', 'fully_furnished', 'male', 'shared'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- Hostel
  'Girls Hostel - Gachibowli', 'Safe and secure girls hostel near major tech parks.',
  'IN', 'India', 'Telangana', 'Hyderabad', 'Gachibowli', '500032', 17.4401, 78.3489, 'Gachibowli, Hyderabad, Telangana',
  'published', 'lst_hst_gcb', 'fully_furnished', 'female', 'shared'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', -- Co-living
  'Modern Co-living Space Koramangala', 'Experience community living in the heart of the city.',
  'IN', 'India', 'Karnataka', 'Bangalore', 'Koramangala', '560034', 12.9279, 77.6271, 'Koramangala 5th Block, Bangalore, Karnataka',
  'published', 'lst_col_krm', 'fully_furnished', 'any', 'mixed'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', -- Apartment
  '2BHK Apartment in Kondapur', 'Semi-furnished 2BHK perfect for small families.',
  'IN', 'India', 'Telangana', 'Hyderabad', 'Kondapur', '500084', 17.4622, 78.3568, 'Kondapur Main Road, Hyderabad, Telangana',
  'published', 'lst_apt_knd', 'semi_furnished', 'any', 'private'
);

-- Seed Pricing
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, minimum_duration, security_deposit, maintenance_fee) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 12000, 'INR', 'month', 3, 24000, 0), -- PG
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 9500, 'INR', 'month', 6, 19000, 0), -- Girls Hostel
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 25000, 'INR', 'month', 1, 50000, 1500), -- Co-living
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 45000, 'INR', 'month', 11, 135000, 3000); -- Apartment

-- Seed Availability
INSERT INTO public.listing_availability (listing_id, available_from, available_units, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', CURRENT_DATE, 5, 'available'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', CURRENT_DATE + INTERVAL '5 days', 12, 'available'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', CURRENT_DATE, 2, 'available'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', CURRENT_DATE + INTERVAL '15 days', 1, 'available');

-- Add Images (Sample Placehold Links)
INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'https://placehold.co/800x600/e2e8f0/1e293b?text=EliteStay', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'https://placehold.co/800x600/e2e8f0/1e293b?text=EliteStay', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'https://placehold.co/800x600/e2e8f0/1e293b?text=EliteStay', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'https://placehold.co/800x600/e2e8f0/1e293b?text=EliteStay', 1);

-- Link Amenities to Listings
-- PG gets Wi-Fi, Water, Electricity, Meals, Bike Parking
INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'), -- Wifi
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12'), -- Electricity
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'), -- Water
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b19'), -- Meals
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23'); -- Bike Parking
-- 20260731050000_rpc_india_first.sql

CREATE OR REPLACE FUNCTION public.get_listing_detail(p_public_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(l_data) INTO result
    FROM (
        SELECT 
            l.id,
            l.public_id,
            l.title,
            l.description,
            l.status,
            l.furnishing,
            l.gender_preference,
            l.occupancy_type,
            l.created_at,
            l.country_code,
            l.country,
            l.state,
            l.city,
            l.locality,
            l.postal_code,
            l.latitude,
            l.longitude,
            l.formatted_address,
            (
                SELECT row_to_json(t)
                FROM (
                    SELECT name, description
                    FROM public.accommodation_types
                    WHERE id = l.accommodation_type_id
                ) t
            ) as accommodation_type,
            (
                SELECT row_to_json(h)
                FROM (
                    SELECT 
                        p.id,
                        p.full_name,
                        p.avatar_url,
                        p.created_at
                    FROM public.profiles p
                    WHERE p.id = l.host_id
                ) h
            ) as host,
            (
                SELECT row_to_json(pr)
                FROM (
                    SELECT 
                        amount,
                        currency,
                        billing_period,
                        security_deposit,
                        maintenance_fee,
                        maintenance_fee_period,
                        minimum_duration,
                        maximum_duration
                    FROM public.listing_prices
                    WHERE listing_id = l.id
                ) pr
            ) as pricing,
            (
                SELECT row_to_json(av)
                FROM (
                    SELECT 
                        available_from,
                        available_units,
                        status
                    FROM public.listing_availability
                    WHERE listing_id = l.id
                ) av
            ) as availability,
            (
                SELECT COALESCE(json_agg(row_to_json(img)), '[]'::json)
                FROM (
                    SELECT 
                        storage_path as image_url,
                        display_order
                    FROM public.listing_images
                    WHERE listing_id = l.id
                    ORDER BY display_order ASC
                ) img
            ) as images,
            (
                SELECT COALESCE(json_agg(row_to_json(am)), '[]'::json)
                FROM (
                    SELECT 
                        a.name,
                        a.icon
                    FROM public.listing_amenities la
                    JOIN public.amenities a ON a.id = la.amenity_id
                    WHERE la.listing_id = l.id
                ) am
            ) as amenities
        FROM public.listings l
        JOIN public.accommodation_types act ON act.id = l.accommodation_type_id
        JOIN public.listing_prices lpr ON lpr.listing_id = l.id
        WHERE l.public_id = p_public_id
        AND (
            l.status = 'published' 
            OR public.is_listing_owner(l.id) 
            OR public.is_admin()
        )
    ) l_data;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 20260731060000_maintenance_fee_and_buckets.sql

-- 1. Add maintenance_fee_period to listing_prices
-- First we add the column using the existing billing_period enum.
-- We also add a default value to not break existing rows, then we can drop the default if we want, but it's fine to keep it.
ALTER TABLE public.listing_prices 
ADD COLUMN IF NOT EXISTS maintenance_fee_period billing_period DEFAULT 'semester'::billing_period;

-- 2. Create Storage Buckets with strict size limits
-- listings: max 2MB
