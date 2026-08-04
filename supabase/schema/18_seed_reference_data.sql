/*
==================================================
Domain: Seed Reference Data
Purpose: Initialize master reference data (accommodation types, amenities, geography).
NOTE: No demo or fake user/listing data is seeded here.
==================================================
*/

-- 1. Insert Accommodation Types
INSERT INTO public.accommodation_types (id, name, slug, description, icon, display_order, is_active) VALUES
  ('147a6d96-47d0-428a-b541-6d83a82def8c', 'Paying Guest', 'pg', 'Shared paying guest accommodation with optional meals and managed services.', 'users', 10, true),
  ('24aac50b-0999-49d2-9487-07c1b5068283', 'Hostel', 'hostel', 'Shared hostel accommodation for students and working professionals.', 'building', 20, true),
  ('21cc18a1-ba31-4ede-89f4-2c8c15a53122', 'Apartment', 'apartment', 'Independent apartments and flats for long-term living.', 'building-2', 40, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Serviced Apartment', 'serviced-apartment', 'Fully furnished apartments with inclusive management and utilities.', 'hotel', 50, true),
  ('2c6e8ec1-7fda-4dee-8583-457ae38e584c', 'Co-living', 'coliving', 'Professionally managed shared living spaces with community amenities.', 'users-round', 60, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Independent House', 'house', 'Spacious independent houses and villas for complete privacy.', 'home', 70, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Villa', 'villa', 'Premium, spacious private estates for luxury long-term living.', 'palmtree', 80, true)

ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- 2. Insert Amenities
INSERT INTO public.amenities (id, slug, name, icon, description) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14', 'ac', 'AC', 'snowflake', 'Individual air conditioning unit for temperature-controlled comfort'),
  ('911cfcae-3f3a-4638-a375-db160ececf88', 'air-conditioning', 'Air Conditioning', 'snowflake', 'Centralized or individual air conditioning system throughout the living spaces'),
  ('a7e555fa-4355-42d4-b771-74683e20de69', 'balcony', 'Balcony', 'sun', 'Private open-air balcony offering natural light and outdoor seating'),
  ('61893515-ae4c-4d5c-816e-a9362637774b', 'bbq-area', 'BBQ Area', 'flame', 'Designated outdoor barbecue cooking area for social gatherings'),
  ('be6cd78c-da65-48a3-9623-182dfd0cf360', 'bed', 'Bed', 'bed', 'Sturdy bed frame equipped with a comfortable, quality mattress'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23', 'bike-parking', 'Bike Parking', 'bike', 'Secure on-site covered two-wheeler parking'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'biometric-entry', 'Biometric Entry', 'fingerprint', 'Keyless fingerprint or smart biometric access for enhanced resident security'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b24', 'car-parking', 'Car Parking', 'car', 'Designated parking slot for cars within the gated premises'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b20', 'cctv', 'CCTV', 'shield', '24/7 common area video surveillance monitoring for resident safety'),
  ('5417bf3b-a8af-4b4e-9c25-1c3762a26334', 'common-room', 'Common Room', 'users', 'Shared community lounge for socializing, reading, and relaxing'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'electricity', 'Electricity', 'zap', 'Reliable 24-hour grid electrical connection included or sub-metered'),
  ('dbf2738f-2a14-4195-b23d-62cea709774b', 'fire-alarm', 'Fire Alarm', 'bell', 'Integrated smoke detectors and emergency fire alert system'),
  ('a4c3cb40-766b-4775-bdd2-01a63408f4ad', 'garden', 'Garden', 'trees', 'Lush landscaped green garden area on the property ground'),
  ('063a5337-40b4-421e-b48e-3c55435c7b4a', 'gas-stove', 'Gas Stove', 'flame', 'Cooking cooktop with secure gas connection for daily meal prep'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15', 'geyser', 'Geyser', 'thermometer', 'Instant electric or solar water heater for warm showers at any time'),
  ('e85bbea1-df7e-47af-986e-52c6f39e2d26', 'gym', 'Gym', 'dumbbell', 'On-site fitness facility equipped with free weights and workout cardio machines'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b18', 'housekeeping', 'Housekeeping', 'sparkles', 'Professional room cleaning and common facility housekeeping service'),
  ('e0b3bf05-9d7e-40c4-8566-e6402681f486', 'kitchen', 'Kitchen', 'kitchen', 'Access to a well-equipped shared or private cooking kitchen'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b17', 'laundry', 'Laundry', 'shirt', 'Washing machines and drying amenities available on-site for daily laundry'),
  ('d5316f00-a375-4bb2-8251-1500461bcba5', 'lift', 'Lift', 'arrow-up-down', 'Modern building elevator providing step-free access to all floor levels'),
  ('ae9c1663-7a71-4e25-939f-5ba836638b3c', 'lockers', 'Lockers', 'lock', 'Personal secure lockable storage compartments for valuables'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b19', 'meals', 'Meals', 'utensils', 'Nutritious daily breakfast, lunch, and dinner meal service included or optional'),
  ('dc002ec2-8f06-4394-b23c-299c7ea87cf2', 'mess', 'Mess', 'utensils', 'Dedicated communal dining hall served with prepared home-style food'),
  ('695b7d1b-50cd-4827-bbc3-a5840b6604a6', 'microwave', 'Microwave', 'microwave', 'Shared or private microwave appliance for quick reheating and cooking'),
  ('347b67d2-2cbb-4b77-a855-26ad3435fb73', 'parking', 'Parking', 'parking', 'Safe residential vehicular parking available on or directly beside property'),
  ('c12de6da-5ab8-4de0-b783-e9967c0aa087', 'pet-friendly', 'Pet Friendly', 'heart', 'Accommodates well-behaved companion domestic pets'),
  ('ffd25b7b-7ed3-43bf-aea6-2aa8dbcf1326', 'pool', 'Pool', 'waves', 'Relaxing recreational swimming pool accessible to community residents'),
  ('56ea708d-2211-4727-be02-8dd3867c0c16', 'power-backup', 'Power Backup', 'zap', 'Uninterrupted generator or inverter backup power during grid outages'),
  ('460d474f-4b90-4be8-acf2-7c18be016c76', 'private-parking', 'Private Parking', 'car', 'Dedicated personal parking space reserved exclusively for this listing'),
  ('651ca3d4-7149-4351-9921-28aa51726114', 'reception', 'Reception', 'user-check', 'On-site help desk or front desk concierge for mail and visitor support'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16', 'refrigerator', 'Refrigerator', 'refrigerator', 'Cold storage food preservation refrigerator provided in kitchen or room'),
  ('457d57b6-8de8-4fe0-bf0c-f40325163c64', 'ro-water', 'RO Water', 'droplets', 'Filtered Reverse Osmosis drinking water purified on location'),
  ('0baca21b-d280-4fc4-9e90-eab66bbded46', 'security', 'Security', 'shield-check', 'Gated premises featuring rigorous security measures and monitored ingress'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 'security-guard', 'Security Guard', 'shield', 'Trained physical security personnel patrolling the property around the clock'),
  ('31482418-e3aa-4fc0-8a31-97a8d4e314b4', 'study-area', 'Study Area', 'book-open', 'Quiet dedicated co-working and study atmosphere with adequate reading lighting'),
  ('e2da738d-cc56-4fca-b4c9-07480b68c52d', 'study-table', 'Study Table', 'table', 'Private work desk and ergonomic study chair furnished inside the bedroom'),
  ('6a8f3e6b-ee6c-4c1b-b84b-433f6a34bcfd', 'terrace', 'Terrace', 'sun', 'Open rooftop communal terrace overlooking neighborhood surroundings'),
  ('84cab1c3-4d43-4aba-bfbe-de3814f2ad22', 'wardrobe', 'Wardrobe', 'archive', 'Spacious storage cupboard or closet with clothes hanging rail and shelving'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'water', 'Water', 'droplets', 'Dependable around-the-clock municipal or borewell utility water supply'),
  ('49fee734-7dfc-45d1-a812-b2c138cfa5ec', 'wheelchair-access', 'Wheelchair Access', 'accessibility', 'Step-free level access ramps and widened doorways for mobility support'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'wi-fi', 'Wi-Fi', 'wifi', 'High-speed wireless internet broadband connectivity for work and entertainment'),
  ('c2d5152e-fd3d-4ff7-b7f0-1cdf7af7f22e', 'wifi', 'WiFi', 'wifi', 'Fast wireless internet coverage across individual rooms and shared facilities')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, icon = EXCLUDED.icon, description = EXCLUDED.description;

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
        (tg_id, 'IN-HYD', 'Hyderabad', '{"hydarabad","Hyd"}', 'hyderabad', 17.3850, 78.4867, 'Asia/Kolkata', true, true, true, 4, 'The City of Pearls, famous for its rich history, IT industry, and biryani.'),
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
        (ap_id, 'IN-AP-VIJA', 'Vijayawada', '{"Bezawada"}', 'vijayawada', 16.5062, 80.6480, 'Asia/Kolkata', false, false, true, 17, 'The commercial hub of Andhra Pradesh, situated on the banks of the Krishna River.'),
        (ap_id, 'IN-AP-GUNT', 'Guntur', '{}', 'guntur', 16.3067, 80.4365, 'Asia/Kolkata', false, false, true, 18, 'A major educational and commercial center, known for its chili exports.'),
        (tg_id, 'IN-TG-WARA', 'Warangal', '{}', 'warangal', 17.9815, 79.5982, 'Asia/Kolkata', false, false, true, 19, 'A historical city known for its ancient temples and monuments.'),
        (ap_id, 'IN-AP-TIRU', 'Tirupati', '{"Chittoor"}', 'tirupati', 13.6288, 79.4192, 'Asia/Kolkata', false, false, true, 20, 'The spiritual capital of Andhra Pradesh, home to the sacred Venkateswara Temple.'),
        (ap_id, 'IN-AP-NELL', 'Nellore', '{}', 'nellore', 14.4426, 79.9865, 'Asia/Kolkata', false, false, true, 21, 'A coastal city known for its agriculture, aquaculture, and ancient temples.'),
        (ap_id, 'IN-AP-RAJA', 'Rajahmundry', '{}', 'rajahmundry', 17.0005, 81.8040, 'Asia/Kolkata', false, false, true, 22, 'The cultural capital of Andhra Pradesh, located on the banks of the Godavari River.'),
        (ap_id, 'IN-AP-KAKI', 'Kakinada', '{}', 'kakinada', 16.9891, 82.2475, 'Asia/Kolkata', false, false, true, 23, 'A major port city known for its peaceful environment and local cuisine.')
    ON CONFLICT (external_code) DO UPDATE SET search_aliases = EXCLUDED.search_aliases;
END $$;

-- 6. Seed Property Types Reference Data
INSERT INTO public.property_types (id, name, slug, description, icon, display_order) VALUES
    (1, 'Apartment', 'apartment', 'Independent residential apartment or flat', 'building', 1),
    (2, 'Villa', 'villa', 'Private villa or upscale independent residence', 'home', 2),
    (3, 'House', 'house', 'Independent residential house or bungalow', 'home', 3),
    (4, 'PG', 'pg', 'Paying guest accommodation with shared amenities', 'users', 4),
    (5, 'Hostel', 'hostel', 'Student or youth hostel dormitory and living spaces', 'bed-double', 5),
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

