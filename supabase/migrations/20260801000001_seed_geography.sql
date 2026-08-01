/*
==================================================
Domain: Geography Seed Data
Purpose: Seed initial countries, states, and major cities for India.
==================================================
*/

-- 1. Seed Country: India
INSERT INTO public.countries (external_code, name, iso2, iso3, currency_code, phone_code, timezone_default)
VALUES ('IN', 'India', 'IN', 'IND', 'INR', '+91', 'Asia/Kolkata')
ON CONFLICT (external_code) DO NOTHING;

-- Get the ID of the country we just inserted
DO $$
DECLARE
    in_id BIGINT;
    ka_id BIGINT;
    mh_id BIGINT;
    dl_id BIGINT;
    tg_id BIGINT;
    mh_pune_id BIGINT;
BEGIN
    SELECT id INTO in_id FROM public.countries WHERE external_code = 'IN';

    -- 2. Seed States
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

    -- Get IDs for featured states
    SELECT id INTO ka_id FROM public.states WHERE external_code = 'IN-KA';
    SELECT id INTO mh_id FROM public.states WHERE external_code = 'IN-MH';
    SELECT id INTO dl_id FROM public.states WHERE external_code = 'IN-DL';
    SELECT id INTO tg_id FROM public.states WHERE external_code = 'IN-TG';

    -- 3. Seed Featured Cities (Bangalore, Mumbai, Delhi, Hyderabad, Pune)
    INSERT INTO public.cities (state_id, external_code, name, search_aliases, slug, latitude, longitude, timezone, is_capital, is_metro, is_featured, sort_order) VALUES
        (ka_id, 'IN-BLR', 'Bangalore', '{"Bengaluru"}', 'bangalore', 12.9716, 77.5946, 'Asia/Kolkata', true, true, true, 1),
        (mh_id, 'IN-BOM', 'Mumbai', '{"Bombay"}', 'mumbai', 19.0760, 72.8777, 'Asia/Kolkata', true, true, true, 2),
        (dl_id, 'IN-DEL', 'New Delhi', '{"Delhi"}', 'new-delhi', 28.6139, 77.2090, 'Asia/Kolkata', true, true, true, 3),
        (tg_id, 'IN-HYD', 'Hyderabad', '{}', 'hyderabad', 17.3850, 78.4867, 'Asia/Kolkata', true, true, true, 4),
        (mh_id, 'IN-PUN', 'Pune', '{"Poona"}', 'pune', 18.5204, 73.8567, 'Asia/Kolkata', false, true, true, 5)
    ON CONFLICT (external_code) DO NOTHING;

END $$;
