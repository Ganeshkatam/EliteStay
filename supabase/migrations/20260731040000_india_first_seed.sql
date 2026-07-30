-- 20260731040000_india_first_seed.sql

-- Clear old listings and seed data
DELETE FROM public.listings;
DELETE FROM public.accommodation_types;
DELETE FROM public.amenities;

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
  id, host_id, accommodation_type_id, title, description, max_occupants,
  country_code, country, state, city, locality, postal_code, latitude, longitude, formatted_address,
  status, public_id, furnishing, gender_preference, occupancy_type
) VALUES
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- PG
  'Premium Boys PG in HSR Layout', 'Spacious shared rooms with all amenities included.', 2,
  'IN', 'India', 'Karnataka', 'Bangalore', 'HSR Layout', '560102', 12.9081, 77.6476, 'HSR Layout Sector 2, Bangalore, Karnataka',
  'published', 'lst_pg_hsr', 'fully_furnished', 'male', 'shared'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- Hostel
  'Girls Hostel - Gachibowli', 'Safe and secure girls hostel near major tech parks.', 3,
  'IN', 'India', 'Telangana', 'Hyderabad', 'Gachibowli', '500032', 17.4401, 78.3489, 'Gachibowli, Hyderabad, Telangana',
  'published', 'lst_hst_gcb', 'fully_furnished', 'female', 'shared'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', -- Co-living
  'Modern Co-living Space Koramangala', 'Experience community living in the heart of the city.', 1,
  'IN', 'India', 'Karnataka', 'Bangalore', 'Koramangala', '560034', 12.9279, 77.6271, 'Koramangala 5th Block, Bangalore, Karnataka',
  'published', 'lst_col_krm', 'fully_furnished', 'any', 'mixed'
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', (SELECT id FROM test_host), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', -- Apartment
  '2BHK Apartment in Kondapur', 'Semi-furnished 2BHK perfect for small families.', 4,
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

-- Add Images (Sample Unsplash Links)
INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 1);

-- Link Amenities to Listings
-- PG gets Wi-Fi, Water, Electricity, Meals, Bike Parking
INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'), -- Wifi
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12'), -- Electricity
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'), -- Water
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b19'), -- Meals
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23'); -- Bike Parking
