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
    INSERT INTO public.cities (state_id, external_code, name, search_aliases, slug, latitude, longitude, timezone, is_capital, is_metro, is_featured, sort_order) VALUES
        (ka_id, 'IN-BLR', 'Bangalore', '{"Bengaluru"}', 'bangalore', 12.9716, 77.5946, 'Asia/Kolkata', true, true, true, 1),
        (mh_id, 'IN-BOM', 'Mumbai', '{"Bombay"}', 'mumbai', 19.0760, 72.8777, 'Asia/Kolkata', true, true, true, 2),
        (dl_id, 'IN-DEL', 'New Delhi', '{"Delhi"}', 'new-delhi', 28.6139, 77.2090, 'Asia/Kolkata', true, true, true, 3),
        (tg_id, 'IN-HYD', 'Hyderabad', '{}', 'hyderabad', 17.3850, 78.4867, 'Asia/Kolkata', true, true, true, 4),
        (mh_id, 'IN-PUN', 'Pune', '{"Poona"}', 'pune', 18.5204, 73.8567, 'Asia/Kolkata', false, true, true, 5),
        (tn_id, 'IN-MAA', 'Chennai', '{"Madras"}', 'chennai', 13.0827, 80.2707, 'Asia/Kolkata', true, true, true, 6),
        (wb_id, 'IN-CCU', 'Kolkata', '{"Calcutta"}', 'kolkata', 22.5726, 88.3639, 'Asia/Kolkata', true, true, true, 7),
        (gj_id, 'IN-AMD', 'Ahmedabad', '{"Amdavad"}', 'ahmedabad', 23.0225, 72.5714, 'Asia/Kolkata', false, true, true, 8),
        (up_id, 'IN-NOI', 'Noida', '{"New Okhla Industrial Development Authority"}', 'noida', 28.5355, 77.3910, 'Asia/Kolkata', false, true, true, 9),
        (hr_id, 'IN-HRG', 'Gurgaon', '{"Gurugram"}', 'gurgaon', 28.4595, 77.0266, 'Asia/Kolkata', false, true, true, 10),
        (rj_id, 'IN-JAI', 'Jaipur', '{"Pink City"}', 'jaipur', 26.9124, 75.7873, 'Asia/Kolkata', true, true, true, 11),
        (up_id, 'IN-LKO', 'Lucknow', '{"Awadh"}', 'lucknow', 26.8467, 80.9462, 'Asia/Kolkata', true, true, true, 12),
        (ch_id, 'IN-IXC', 'Chandigarh', '{}', 'chandigarh', 30.7333, 76.7794, 'Asia/Kolkata', true, true, true, 13),
        (kl_id, 'IN-COK', 'Kochi', '{"Cochin"}', 'kochi', 9.9312, 76.2673, 'Asia/Kolkata', false, true, true, 14),
        (mp_id, 'IN-IDR', 'Indore', '{}', 'indore', 22.7196, 75.8577, 'Asia/Kolkata', false, true, true, 15)
    ON CONFLICT (external_code) DO NOTHING;
END $$;
