/*
==================================================
Domain: Seed Reference Data
Purpose: Initialize master reference data (accommodation types, amenities, geography).
NOTE: No demo or fake user/listing data is seeded here.
==================================================
*/

-- 1. Insert Accommodation Types
INSERT INTO public.accommodation_types (id, name, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PG', 'Managed stays with food & cleaning'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hostel', 'Vibrant student communities'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Apartment', 'Fully independent private flats'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Independent House', 'Spacious independent houses'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Villa', 'Luxe private estate stays'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Private Room', 'Private room in shared homes'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Shared Room', 'Affordable shared flatshares'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Service Apartment', 'Fully-serviced corporate stays'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Co-living', 'Social hubs for young professionals'),

ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Insert Amenities
-- Essentials
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Wi-Fi', 'wifi'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'Electricity', 'zap'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'Water', 'droplets')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Comfort
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14', 'AC', 'snowflake'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15', 'Geyser', 'thermometer'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16', 'Refrigerator', 'refrigerator')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Services
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b17', 'Laundry', 'shirt'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b18', 'Housekeeping', 'broom'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b19', 'Meals', 'utensils')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Security
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b20', 'CCTV', 'camera'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 'Security Guard', 'shield'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Biometric Entry', 'fingerprint')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Parking
INSERT INTO public.amenities (id, name, icon) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23', 'Bike Parking', 'bike'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b24', 'Car Parking', 'car')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;


INSERT INTO public.amenities (id, name, icon) VALUES 
  ('911cfcae-3f3a-4638-a375-db160ececf88', 'Air Conditioning', 'snowflake'),
  ('e0b3bf05-9d7e-40c4-8566-e6402681f486', 'Kitchen', 'kitchen'),
  ('347b67d2-2cbb-4b77-a855-26ad3435fb73', 'Parking', 'parking'),
  ('ffd25b7b-7ed3-43bf-aea6-2aa8dbcf1326', 'Pool', 'pool'),
  ('e85bbea1-df7e-47af-986e-52c6f39e2d26', 'Gym', 'dumbbell'),
  ('c2d5152e-fd3d-4ff7-b7f0-1cdf7af7f22e', 'WiFi', 'wifi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 3. Seed Country: India
INSERT INTO public.countries (external_code, name, iso2, iso3, currency_code, phone_code, timezone_default)
VALUES ('IN', 'India', 'IN', 'IND', 'INR', '+91', 'Asia/Kolkata')
ON CONFLICT (external_code) DO NOTHING;

DO $$
DECLARE
    in_id BIGINT;
    ka_id BIGINT;
    mh_id BIGINT;
    dl_id BIGINT;
    tg_id BIGINT;
    tn_id BIGINT;
    wb_id BIGINT;
    gj_id BIGINT;
    up_id BIGINT;
    hr_id BIGINT;
    rj_id BIGINT;
    ch_id BIGINT;
    kl_id BIGINT;
    mp_id BIGINT;
BEGIN
    SELECT id INTO in_id FROM public.countries WHERE external_code = 'IN';
    IF in_id IS NULL THEN
        RETURN;
    END IF;

    -- 4. Seed States
    INSERT INTO public.states (country_id, external_code, name, code, slug) VALUES
        (in_id, 'IN-AN', 'Andaman and Nicobar Islands', 'AN', 'andaman-and-nicobar-islands'),
        (in_id, 'IN-AP', 'Andhra Pradesh', 'AP', 'andhra-pradesh'),
        (in_id, 'IN-AR', 'Arunachal Pradesh', 'AR', 'arunachal-pradesh'),
        (in_id, 'IN-AS', 'Assam', 'AS', 'assam'),
        (in_id, 'IN-BR', 'Bihar', 'BR', 'bihar'),
        (in_id, 'IN-CH', 'Chandigarh', 'CH', 'chandigarh'),
        (in_id, 'IN-CT', 'Chhattisgarh', 'CT', 'chhattisgarh'),
        (in_id, 'IN-DN', 'Dadra and Nagar Haveli and Daman and Diu', 'DN', 'dadra-and-nagar-haveli-and-daman-and-diu'),
        (in_id, 'IN-DL', 'Delhi', 'DL', 'delhi'),
        (in_id, 'IN-GA', 'Goa', 'GA', 'goa'),
        (in_id, 'IN-GJ', 'Gujarat', 'GJ', 'gujarat'),
        (in_id, 'IN-HR', 'Haryana', 'HR', 'haryana'),
        (in_id, 'IN-HP', 'Himachal Pradesh', 'HP', 'himachal-pradesh'),
        (in_id, 'IN-JK', 'Jammu and Kashmir', 'JK', 'jammu-and-kashmir'),
        (in_id, 'IN-JH', 'Jharkhand', 'JH', 'jharkhand'),
        (in_id, 'IN-KA', 'Karnataka', 'KA', 'karnataka'),
        (in_id, 'IN-KL', 'Kerala', 'KL', 'kerala'),
        (in_id, 'IN-LA', 'Ladakh', 'LA', 'ladakh'),
        (in_id, 'IN-LD', 'Lakshadweep', 'LD', 'lakshadweep'),
        (in_id, 'IN-MP', 'Madhya Pradesh', 'MP', 'madhya-pradesh'),
        (in_id, 'IN-MH', 'Maharashtra', 'MH', 'maharashtra'),
        (in_id, 'IN-MN', 'Manipur', 'MN', 'manipur'),
        (in_id, 'IN-ML', 'Meghalaya', 'ML', 'meghalaya'),
        (in_id, 'IN-MZ', 'Mizoram', 'MZ', 'mizoram'),
        (in_id, 'IN-NL', 'Nagaland', 'NL', 'nagaland'),
        (in_id, 'IN-OR', 'Odisha', 'OR', 'odisha'),
        (in_id, 'IN-PY', 'Puducherry', 'PY', 'puducherry'),
        (in_id, 'IN-PB', 'Punjab', 'PB', 'punjab'),
        (in_id, 'IN-RJ', 'Rajasthan', 'RJ', 'rajasthan'),
        (in_id, 'IN-SK', 'Sikkim', 'SK', 'sikkim'),
        (in_id, 'IN-TN', 'Tamil Nadu', 'TN', 'tamil-nadu'),
        (in_id, 'IN-TG', 'Telangana', 'TG', 'telangana'),
        (in_id, 'IN-TR', 'Tripura', 'TR', 'tripura'),
        (in_id, 'IN-UP', 'Uttar Pradesh', 'UP', 'uttar-pradesh'),
        (in_id, 'IN-UT', 'Uttarakhand', 'UT', 'uttarakhand'),
        (in_id, 'IN-WB', 'West Bengal', 'WB', 'west-bengal')
    ON CONFLICT (external_code) DO NOTHING;

    SELECT id INTO ka_id FROM public.states WHERE external_code = 'IN-KA';
    SELECT id INTO mh_id FROM public.states WHERE external_code = 'IN-MH';
    SELECT id INTO dl_id FROM public.states WHERE external_code = 'IN-DL';
    SELECT id INTO tg_id FROM public.states WHERE external_code = 'IN-TG';
    SELECT id INTO tn_id FROM public.states WHERE external_code = 'IN-TN';
    SELECT id INTO wb_id FROM public.states WHERE external_code = 'IN-WB';
    SELECT id INTO gj_id FROM public.states WHERE external_code = 'IN-GJ';
    SELECT id INTO up_id FROM public.states WHERE external_code = 'IN-UP';
    SELECT id INTO hr_id FROM public.states WHERE external_code = 'IN-HR';
    SELECT id INTO rj_id FROM public.states WHERE external_code = 'IN-RJ';
    SELECT id INTO ch_id FROM public.states WHERE external_code = 'IN-CH';
    SELECT id INTO kl_id FROM public.states WHERE external_code = 'IN-KL';
    SELECT id INTO mp_id FROM public.states WHERE external_code = 'IN-MP';

    -- 5. Seed Featured Cities
    INSERT INTO public.cities (state_id, external_code, name, search_aliases, slug, latitude, longitude, timezone, is_capital, is_metro, is_featured, sort_order, description) VALUES
        (ka_id, 'IN-BLR', 'Bangalore', '{"Bengaluru"}', 'bangalore', 12.9716, 77.5946, 'Asia/Kolkata', true, true, true, 1, 'The Silicon Valley of India, known for its pleasant weather and tech parks.'),
        (mh_id, 'IN-BOM', 'Mumbai', '{"Bombay"}', 'mumbai', 19.0760, 72.8777, 'Asia/Kolkata', true, true, true, 2, 'The financial capital of India, famous for its bustling lifestyle and Bollywood.'),
        (dl_id, 'IN-DEL', 'New Delhi', '{"Delhi"}', 'new-delhi', 28.6139, 77.2090, 'Asia/Kolkata', true, true, true, 3, 'The capital city, blending historical monuments with vibrant culture.'),
        (tg_id, 'IN-HYD', 'Hyderabad', '{}', 'hyderabad', 17.3850, 78.4867, 'Asia/Kolkata', true, true, true, 4, 'The City of Pearls, famous for its rich history, IT industry, and biryani.'),
        (mh_id, 'IN-PUN', 'Pune', '{"Poona"}', 'pune', 18.5204, 73.8567, 'Asia/Kolkata', false, true, true, 5, 'The Oxford of the East, a vibrant city known for education and IT hubs.'),
        (tn_id, 'IN-MAA', 'Chennai', '{"Madras"}', 'chennai', 13.0827, 80.2707, 'Asia/Kolkata', true, true, true, 6, 'The cultural capital of South India, known for its temples and beautiful beaches.'),
        (wb_id, 'IN-CCU', 'Kolkata', '{"Calcutta"}', 'kolkata', 22.5726, 88.3639, 'Asia/Kolkata', true, true, true, 7, 'The City of Joy, renowned for its literature, arts, and colonial architecture.'),
        (gj_id, 'IN-AMD', 'Ahmedabad', '{"Amdavad"}', 'ahmedabad', 23.0225, 72.5714, 'Asia/Kolkata', false, true, true, 8, 'A fast-growing metropolis known for its textile industry and rich heritage.'),
        (up_id, 'IN-NOI', 'Noida', '{"New Okhla Industrial Development Authority"}', 'noida', 28.5355, 77.3910, 'Asia/Kolkata', false, true, true, 9, 'A major IT and industrial hub in the National Capital Region.'),
        (hr_id, 'IN-HRG', 'Gurgaon', '{"Gurugram"}', 'gurgaon', 28.4595, 77.0266, 'Asia/Kolkata', false, true, true, 10, 'The Millennium City, a leading financial and technology center.'),
        (rj_id, 'IN-JAI', 'Jaipur', '{"Pink City"}', 'jaipur', 26.9124, 75.7873, 'Asia/Kolkata', true, true, true, 11, 'The Pink City, known for its majestic palaces, forts, and vibrant culture.'),
        (up_id, 'IN-LKO', 'Lucknow', '{"Awadh"}', 'lucknow', 26.8467, 80.9462, 'Asia/Kolkata', true, true, true, 12, 'The City of Nawabs, famous for its rich culture, architecture, and cuisine.'),
        (ch_id, 'IN-IXC', 'Chandigarh', '{}', 'chandigarh', 30.7333, 76.7794, 'Asia/Kolkata', true, true, true, 13, 'The City Beautiful, known for its urban design and architecture.'),
        (kl_id, 'IN-COK', 'Kochi', '{"Cochin"}', 'kochi', 9.9312, 76.2673, 'Asia/Kolkata', false, true, true, 14, 'The Queen of the Arabian Sea, a vibrant port city with a rich history.'),
        (mp_id, 'IN-IDR', 'Indore', '{}', 'indore', 22.7196, 75.8577, 'Asia/Kolkata', false, true, true, 15, 'The cleanest city in India, known for its food culture and heritage.'),
        (ap_id, 'IN-AP-VIZAG', 'Visakhapatnam', '{"Vizag"}', 'visakhapatnam', 17.6868, 83.2185, 'Asia/Kolkata', true, true, true, 16, 'The Jewel of the East Coast, known for its pristine beaches and natural harbor.'),
        (ap_id, 'IN-AP-VIJA', 'Vijayawada', '{}', 'vijayawada', 16.5062, 80.6480, 'Asia/Kolkata', false, false, true, 17, 'The commercial hub of Andhra Pradesh, situated on the banks of the Krishna River.'),
        (ap_id, 'IN-AP-GUNT', 'Guntur', '{}', 'guntur', 16.3067, 80.4365, 'Asia/Kolkata', false, false, true, 18, 'A major educational and commercial center, known for its chili exports.'),
        (tg_id, 'IN-TG-WARA', 'Warangal', '{}', 'warangal', 17.9815, 79.5982, 'Asia/Kolkata', false, false, true, 19, 'A historical city known for its ancient temples and monuments.'),
        (ap_id, 'IN-AP-TIRU', 'Tirupati', '{}', 'tirupati', 13.6288, 79.4192, 'Asia/Kolkata', false, false, true, 20, 'The spiritual capital of Andhra Pradesh, home to the sacred Venkateswara Temple.'),
        (ap_id, 'IN-AP-NELL', 'Nellore', '{}', 'nellore', 14.4426, 79.9865, 'Asia/Kolkata', false, false, true, 21, 'A coastal city known for its agriculture, aquaculture, and ancient temples.'),
        (ap_id, 'IN-AP-RAJA', 'Rajahmundry', '{}', 'rajahmundry', 17.0005, 81.8040, 'Asia/Kolkata', false, false, true, 22, 'The cultural capital of Andhra Pradesh, located on the banks of the Godavari River.'),
        (ap_id, 'IN-AP-KAKI', 'Kakinada', '{}', 'kakinada', 16.9891, 82.2475, 'Asia/Kolkata', false, false, true, 23, 'A major port city known for its peaceful environment and local cuisine.')
    ON CONFLICT (external_code) DO NOTHING;
END $$;

-- 6. Seed Property Types Reference Data
INSERT INTO public.property_types (id, name, slug, description, icon, display_order) VALUES
    (1, 'Apartment', 'apartment', 'Independent residential apartment or flat', 'building', 1),
    (2, 'Villa', 'villa', 'Private villa or upscale independent residence', 'home', 2),
    (3, 'House', 'house', 'Independent residential house or bungalow', 'home', 3),
    (4, 'PG', 'pg', 'Paying guest accommodation with shared amenities', 'users', 4),
    (5, 'Hostel', 'hostel', 'Student or youth hostel dormitory and living spaces', 'bed-double', 5),
    (6, 'Hotel', 'hotel', 'Serviced room inside a hospitality establishment', 'building-2', 6),
    (7, 'Cabin', 'cabin', 'Private cabin or standalone natural retreat', 'tent', 7),
    (8, 'Dormitory', 'dormitory', 'Shared sleeping quarters with common living spaces', 'bed', 8),
    (9, 'Resort', 'resort', 'Recreational residential resort suite', 'palmtree', 9),
    (10, 'Farmhouse', 'farmhouse', 'Spacious agricultural estate or weekend farmhouse', 'trees', 10)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, icon = EXCLUDED.icon;

-- 7. Seed Amenity Categories Reference Data
INSERT INTO public.amenity_categories (id, name, slug, description, icon, display_order)
VALUES
    (1, 'Internet & Connectivity', 'internet-connectivity', 'High-speed internet and digital communications', 'wifi', 10),
    (2, 'Utilities', 'utilities', 'Essential property power and water supplies', 'zap', 20),
    (3, 'Kitchen & Dining', 'kitchen-dining', 'Cooking appliances, refrigeration, and dining furnishings', 'utensils', 30),
    (4, 'Bedroom & Comfort', 'bedroom-comfort', 'Climate control and bedding comforts', 'bed', 40),
    (5, 'Bathroom & Hygiene', 'bathroom-hygiene', 'Sanitation, hot water geysers, and hygiene fixtures', 'shower', 50),
    (6, 'Safety & Security', 'safety-security', 'Property surveillance, access systems, and guards', 'shield', 60),
    (7, 'Parking & Transit', 'parking-transit', 'Dedicated vehicular parking facilities', 'car', 70),
    (8, 'Laundry & Housekeeping', 'laundry-housekeeping', 'Clothing cleaning and scheduled room maintenance', 'shirt', 80),
    (9, 'Recreation & Wellness', 'recreation-wellness', 'Fitness centers, swimming pools, and recreation', 'dumbbell', 90),
    (10, 'Outdoor & Common Spaces', 'outdoor-common-spaces', 'Shared communal lounges, balconies, and lawns', 'sun', 100),
    (11, 'Services & Managed Care', 'services-managed-care', 'Prepared meals and concierge living assistance', 'concierge-bell', 110)
ON CONFLICT (id) DO NOTHING;

