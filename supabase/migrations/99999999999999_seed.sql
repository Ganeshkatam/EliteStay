-- EliteStay V2 Seed Data

TRUNCATE public.messages, public.conversations, public.notifications, public.reviews, public.stay_events, public.stays, public.booking_events, public.bookings, public.listing_prices, public.listing_images, public.listing_build_progress, public.listing_amenities, public.listings, public.amenities, public.accommodation_types, public.user_preferences, public.profiles CASCADE;

DELETE FROM auth.users WHERE email LIKE '%@elitestay.com';
DELETE FROM auth.identities WHERE provider_id LIKE '%@elitestay.com';

-- 2. Auth Users & Profiles

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('b6dca27a-0fd4-4f8a-8a82-71963f33b85c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","role":"admin"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'b6dca27a-0fd4-4f8a-8a82-71963f33b85c', format('{"sub":"%s","email":"%s"}', 'b6dca27a-0fd4-4f8a-8a82-71963f33b85c', 'admin@elitestay.com')::jsonb, 'email', 'admin@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('98a8feff-a602-44da-95ee-174663d14d64', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Harmony Weber","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '98a8feff-a602-44da-95ee-174663d14d64', format('{"sub":"%s","email":"%s"}', '98a8feff-a602-44da-95ee-174663d14d64', 'host1@elitestay.com')::jsonb, 'email', 'host1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('02daf084-c733-4a69-9d0b-7f9f5f8a4417', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Laila Hodkiewicz","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '02daf084-c733-4a69-9d0b-7f9f5f8a4417', format('{"sub":"%s","email":"%s"}', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'host2@elitestay.com')::jsonb, 'email', 'host2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('b90c1067-aacd-45b5-81fe-587cf0be0250', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Estelle Olson","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'b90c1067-aacd-45b5-81fe-587cf0be0250', format('{"sub":"%s","email":"%s"}', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'host3@elitestay.com')::jsonb, 'email', 'host3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('e6cdb738-a0d3-433b-b961-465eaef6443b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Adrienne Roob","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'e6cdb738-a0d3-433b-b961-465eaef6443b', format('{"sub":"%s","email":"%s"}', 'e6cdb738-a0d3-433b-b961-465eaef6443b', 'guest1@elitestay.com')::jsonb, 'email', 'guest1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('1bd806e8-5ad9-47e9-8378-23e3bf145f31', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Garry Bartell","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '1bd806e8-5ad9-47e9-8378-23e3bf145f31', format('{"sub":"%s","email":"%s"}', '1bd806e8-5ad9-47e9-8378-23e3bf145f31', 'guest2@elitestay.com')::jsonb, 'email', 'guest2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('ce2a28f1-bc87-417b-aa3d-e08202bd95ca', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ryder Moore","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'ce2a28f1-bc87-417b-aa3d-e08202bd95ca', format('{"sub":"%s","email":"%s"}', 'ce2a28f1-bc87-417b-aa3d-e08202bd95ca', 'guest3@elitestay.com')::jsonb, 'email', 'guest3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('f0614744-2c22-47c0-9459-a9c8856a8ca9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest4@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Rudy Daniel","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'f0614744-2c22-47c0-9459-a9c8856a8ca9', format('{"sub":"%s","email":"%s"}', 'f0614744-2c22-47c0-9459-a9c8856a8ca9', 'guest4@elitestay.com')::jsonb, 'email', 'guest4@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('0b4449e0-584d-4961-a563-c1e810791237', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest5@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hoyt Boyer","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '0b4449e0-584d-4961-a563-c1e810791237', format('{"sub":"%s","email":"%s"}', '0b4449e0-584d-4961-a563-c1e810791237', 'guest5@elitestay.com')::jsonb, 'email', 'guest5@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('e6cd4b37-f409-4c49-8b55-099081cb0a03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest6@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Breanna Considine","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'e6cd4b37-f409-4c49-8b55-099081cb0a03', format('{"sub":"%s","email":"%s"}', 'e6cd4b37-f409-4c49-8b55-099081cb0a03', 'guest6@elitestay.com')::jsonb, 'email', 'guest6@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('4533d975-9576-4183-88fe-0272a1966e4b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest7@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bianka Keebler Jr.","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '4533d975-9576-4183-88fe-0272a1966e4b', format('{"sub":"%s","email":"%s"}', '4533d975-9576-4183-88fe-0272a1966e4b', 'guest7@elitestay.com')::jsonb, 'email', 'guest7@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('522c5524-30d4-44b9-abce-89cfefeb8d0c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest8@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ivy Fisher","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '522c5524-30d4-44b9-abce-89cfefeb8d0c', format('{"sub":"%s","email":"%s"}', '522c5524-30d4-44b9-abce-89cfefeb8d0c', 'guest8@elitestay.com')::jsonb, 'email', 'guest8@elitestay.com', now(), now(), now());

-- 3. Override roles in profiles (since trigger defaults to guest)
UPDATE public.profiles SET role = 'admin' WHERE id = 'b6dca27a-0fd4-4f8a-8a82-71963f33b85c';
UPDATE public.profiles SET role = 'host' WHERE id = '98a8feff-a602-44da-95ee-174663d14d64';
UPDATE public.profiles SET role = 'host' WHERE id = '02daf084-c733-4a69-9d0b-7f9f5f8a4417';
UPDATE public.profiles SET role = 'host' WHERE id = 'b90c1067-aacd-45b5-81fe-587cf0be0250';

-- 4. Accommodation Types and Amenities
INSERT INTO public.accommodation_types (id, name, description) VALUES 
(gen_random_uuid(), 'PG', 'Paying Guest Accommodation'),
(gen_random_uuid(), 'Apartment', 'Full Apartment'),
(gen_random_uuid(), 'Hostel', 'Shared Hostel'),
(gen_random_uuid(), 'Coliving', 'Co-living space'),
(gen_random_uuid(), 'Student Housing', 'Housing for students');

INSERT INTO public.amenities (id, name, icon) VALUES 
(gen_random_uuid(), 'WiFi', 'wifi'),
(gen_random_uuid(), 'Air Conditioning', 'snowflake'),
(gen_random_uuid(), 'Kitchen', 'kitchen'),
(gen_random_uuid(), 'Parking', 'parking'),
(gen_random_uuid(), 'Pool', 'pool'),
(gen_random_uuid(), 'Gym', 'dumbbell');

-- 5. Listings

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('65b61d7f-0637-43a7-8806-50687ebb35f1', 'MVOGRCTJ', '98a8feff-a602-44da-95ee-174663d14d64', 'Modern 2BHK Apartment in Bandra', 'Experience the vibrant life of Mumbai in this beautifully furnished 2BHK apartment. Just a walk away from Carter Road and top cafes.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '663 Clark Street', 'Koramangala', 'Bangalore', 'Karnataka', '27139-5581', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('65b61d7f-0637-43a7-8806-50687ebb35f1', 19442, 'INR', 'month', 3394);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('d06592ca-b338-4647-b773-78f7dc63c7ed', 'NTLFGYHL', '98a8feff-a602-44da-95ee-174663d14d64', 'Luxury Suite near Connaught Place', 'Located in the heart of the capital, this luxury suite offers unparalleled access to Delhi''s best dining and shopping destinations.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '482 Hudson Estate', 'Bandra', 'Mumbai', 'Maharashtra', '50668-0172', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('d06592ca-b338-4647-b773-78f7dc63c7ed', 16649, 'INR', 'month', 8556);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('fb55db7c-3f55-493e-9820-394152e13ab2', 'YNKX3NZF', '98a8feff-a602-44da-95ee-174663d14d64', 'Spacious Villa in Banjara Hills', 'A grand villa in the upscale neighborhood of Banjara Hills. Perfect for families looking for a luxurious stay with premium amenities.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '64687 Kiehn Motorway', 'Connaught Place', 'New Delhi', 'Delhi', '70773-4973', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('fb55db7c-3f55-493e-9820-394152e13ab2', 25706, 'INR', 'month', 8595);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('6dadd100-38a6-4031-9588-a1c60ed26216', 'II0ZWZLA', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Cozy Studio in Koregaon Park', 'A peaceful and cozy studio surrounded by the lush greenery of Koregaon Park. Ideal for solo travelers and couples.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '1918 N Maple Street', 'Banjara Hills', 'Hyderabad', 'Telangana', '02310-8423', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('6dadd100-38a6-4031-9588-a1c60ed26216', 14087, 'INR', 'month', 2553);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('0ed0cc6d-0101-479e-a989-d3c9bbb10057', 'AXEUMA5G', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'Premium 3BHK in Koramangala', 'Spacious 3-bedroom apartment in Koramangala with modern decor, high-speed WiFi, and close proximity to the best startup hubs and pubs.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '2682 Veterans Memorial Highway', 'Koregaon Park', 'Pune', 'Maharashtra', '03790-3714', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('0ed0cc6d-0101-479e-a989-d3c9bbb10057', 12950, 'INR', 'month', 3432);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('20478a1c-bd9a-4517-8394-9f1d99f61678', 'DNEUL79U', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Sea-view Penthouse in Bandra West', 'Wake up to the sound of waves in this premium sea-view penthouse. Features a private terrace and exquisite modern interiors.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '16036 16th Street', 'Koramangala', 'Bangalore', 'Karnataka', '95211-1065', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('20478a1c-bd9a-4517-8394-9f1d99f61678', 15920, 'INR', 'month', 4467);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('38f6f08f-e87b-4368-b828-e9650c65d526', 'GEYSSHTK', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'Heritage Stay in Central Delhi', 'Step back in time with this beautifully restored heritage home, located just minutes away from the bustling Connaught Place.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '408 New Street', 'Bandra', 'Mumbai', 'Maharashtra', '43077', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('38f6f08f-e87b-4368-b828-e9650c65d526', 7180, 'INR', 'month', 5290);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('fef727cf-e561-40dc-9c5d-7b618c1275b7', 'U7EWJQLE', '98a8feff-a602-44da-95ee-174663d14d64', 'Elegant Home with Garden in Banjara Hills', 'An elegant home featuring a private garden space, located in the peaceful and prestigious Banjara Hills area.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '6155 Maggio Forges', 'Connaught Place', 'New Delhi', 'Delhi', '69708', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('fef727cf-e561-40dc-9c5d-7b618c1275b7', 21408, 'INR', 'month', 5082);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('9c268957-7b6c-4623-843f-225b2af07a79', 'DLUA3EQW', '98a8feff-a602-44da-95ee-174663d14d64', 'Chic Loft near Osho Ashram Pune', 'A trendy, industrial-style loft located right next to the famous Osho Ashram. Experience tranquility with a modern touch.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '505 7th Avenue', 'Banjara Hills', 'Hyderabad', 'Telangana', '30993-1056', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('9c268957-7b6c-4623-843f-225b2af07a79', 9589, 'INR', 'month', 4329);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('46e3abe1-1430-4b8d-8cf3-5e1ce3f6e166', 'IVD2OIYG', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'Boutique Apartment in heart of Koramangala', 'A boutique apartment offering a blend of comfort and style. Located right in the heart of Bangalore''s favorite neighborhood.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '105 Hayes Ferry', 'Koregaon Park', 'Pune', 'Maharashtra', '82866-7598', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('46e3abe1-1430-4b8d-8cf3-5e1ce3f6e166', 18635, 'INR', 'month', 1412);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('1e35acc5-ff52-4318-b9a4-812a699ab90e', 'DKLPYJYW', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Minimalist 1BHK in Bandra', 'Clean, minimalist, and perfectly located. This 1BHK offers everything you need for a comfortable stay in Mumbai.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '401 Wood Lane', 'Koramangala', 'Bangalore', 'Karnataka', '50587', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('1e35acc5-ff52-4318-b9a4-812a699ab90e', 5161, 'INR', 'month', 9850);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('0f349537-e821-4a9a-b284-aa33c140d60e', 'R3LXDWBV', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Business Suite near CP Metro', 'Designed for the modern business traveler, this suite offers a dedicated workspace and is just steps away from the metro station.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '691 Angelo Freeway', 'Bandra', 'Mumbai', 'Maharashtra', '90032-0135', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('0f349537-e821-4a9a-b284-aa33c140d60e', 24179, 'INR', 'month', 9048);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('4ae0d669-beb1-4581-b78b-0834852b314c', 'IWNKRMNM', '98a8feff-a602-44da-95ee-174663d14d64', 'Royal Villa Stay in Hyderabad', 'Live like royalty in this expansive villa. Features traditional architecture blended with modern comforts and a private pool.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '287 McKenzie Dam', 'Connaught Place', 'New Delhi', 'Delhi', '71141-0095', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('4ae0d669-beb1-4581-b78b-0834852b314c', 14079, 'INR', 'month', 1608);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('53303d0e-9cba-41b2-b5ca-e404068d1ece', 'R6DLAVQX', '98a8feff-a602-44da-95ee-174663d14d64', 'Serene Getaway in Koregaon Park', 'Escape the city noise in this serene Koregaon Park retreat. Enjoy your morning coffee on the spacious balcony overlooking old banyan trees.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '41825 Oberbrunner Rapid', 'Banjara Hills', 'Hyderabad', 'Telangana', '06008', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('53303d0e-9cba-41b2-b5ca-e404068d1ece', 20907, 'INR', 'month', 7351);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('9c468099-3425-434e-945e-302cb8189386', 'HSIOGCAK', '98a8feff-a602-44da-95ee-174663d14d64', 'Tech-Hub Studio Koramangala', 'Perfect for digital nomads! This studio offers gigabit internet, an ergonomic workspace, and is close to all major tech parks.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '951 DuBuque-Cronin Crescent', 'Koregaon Park', 'Pune', 'Maharashtra', '37666', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('9c468099-3425-434e-945e-302cb8189386', 18492, 'INR', 'month', 9770);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('a52f575e-ad4b-4955-bc40-ddda198cf87c', 'DQKLYGI7', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Artistic Haven in Bandra', 'An artistic space curated with local art and vintage furniture. A true reflection of Bandra''s creative soul.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '245 Viola Unions', 'Koramangala', 'Bangalore', 'Karnataka', '32550', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('a52f575e-ad4b-4955-bc40-ddda198cf87c', 11720, 'INR', 'month', 6707);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('2e410bd2-dfa2-4f43-9d04-fecc475dcc98', '4RSI0YNQ', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Classic Delhi Home near Connaught Place', 'A classic Delhi home with high ceilings and spacious rooms. Experience authentic North Indian hospitality in a prime location.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '224 Aaron Creek', 'Bandra', 'Mumbai', 'Maharashtra', '60494', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('2e410bd2-dfa2-4f43-9d04-fecc475dcc98', 25685, 'INR', 'month', 7520);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('8dd39716-623e-4920-8048-d5097eed2386', 'I0ZNYV5M', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'Luxury Service Apt Banjara Hills', 'Fully serviced luxury apartment with daily housekeeping, in-house chef available on request, and round-the-clock security.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '6995 Hillside Avenue', 'Connaught Place', 'New Delhi', 'Delhi', '29279-2422', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('8dd39716-623e-4920-8048-d5097eed2386', 16144, 'INR', 'month', 5320);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('86e2fb31-5a91-424d-8a92-2384adb8501e', 'WVNHXIFM', '98a8feff-a602-44da-95ee-174663d14d64', 'Green Retreat in Koregaon Park', 'Surround yourself with nature in this beautiful green retreat. Features indoor plants and eco-friendly amenities.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '3061 Jenkins Ridge', 'Banjara Hills', 'Hyderabad', 'Telangana', '72152-7966', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('86e2fb31-5a91-424d-8a92-2384adb8501e', 11944, 'INR', 'month', 6993);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, postal_code, status)
VALUES ('f4ab8373-5e99-426f-9cec-eeeaf85dbc19', 'DNPDHW3J', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'Modern Flat with Balcony in Koramangala', 'A bright and airy modern flat featuring a large balcony. Perfect for enjoying Bangalore''s beautiful weather.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '66453 Mount Pleasant', 'Koregaon Park', 'Pune', 'Maharashtra', '61276', 'published');

INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('f4ab8373-5e99-426f-9cec-eeeaf85dbc19', 9461, 'INR', 'month', 6797);

-- 6. Bookings and Stays

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('854d9d75-f526-4dd4-8ca1-6ea6cfeebd98', '65b61d7f-0637-43a7-8806-50687ebb35f1', 'e6cdb738-a0d3-433b-b961-465eaef6443b', '2026-08-01', 3, 'pending', 10000, 5000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('854d9d75-f526-4dd4-8ca1-6ea6cfeebd98', 'request_created', 'e6cdb738-a0d3-433b-b961-465eaef6443b', 'pending');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('4fac74fa-3e6e-41e9-ad26-907191f8754e', 'd06592ca-b338-4647-b773-78f7dc63c7ed', '1bd806e8-5ad9-47e9-8378-23e3bf145f31', '2026-08-02', 3, 'approved', 12000, 6000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('4fac74fa-3e6e-41e9-ad26-907191f8754e', 'request_created', '1bd806e8-5ad9-47e9-8378-23e3bf145f31', 'pending');
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('4fac74fa-3e6e-41e9-ad26-907191f8754e', 'approved', '98a8feff-a602-44da-95ee-174663d14d64', 'pending', 'approved');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('374732ba-346d-4a68-a5b4-a75d3c51daa8', 'fb55db7c-3f55-493e-9820-394152e13ab2', 'ce2a28f1-bc87-417b-aa3d-e08202bd95ca', '2026-08-01', 3, 'rejected', 8000, 4000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('374732ba-346d-4a68-a5b4-a75d3c51daa8', 'rejected', '98a8feff-a602-44da-95ee-174663d14d64', 'pending', 'rejected');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('107966e9-9eec-4146-85c7-30ae5fe538dd', '6dadd100-38a6-4031-9588-a1c60ed26216', 'f0614744-2c22-47c0-9459-a9c8856a8ca9', '2026-07-31', 3, 'approved', 15000, 7000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('35e28842-d915-43f9-9bf3-882d0e77dce5', '107966e9-9eec-4146-85c7-30ae5fe538dd', '6dadd100-38a6-4031-9588-a1c60ed26216', 'f0614744-2c22-47c0-9459-a9c8856a8ca9', 'active', '2026-07-31', '2026-07-31', '2026-10-31', 15000, 'month', 7000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('35e28842-d915-43f9-9bf3-882d0e77dce5', 'active', '02daf084-c733-4a69-9d0b-7f9f5f8a4417', 'active');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('90ae676a-4231-4cf6-94b9-d36ffda50564', '0ed0cc6d-0101-479e-a989-d3c9bbb10057', '0b4449e0-584d-4961-a563-c1e810791237', '2026-05-08', 3, 'approved', 11000, 5000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, actual_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('d773023d-b189-45ab-9df4-d294d2b05641', '90ae676a-4231-4cf6-94b9-d36ffda50564', '0ed0cc6d-0101-479e-a989-d3c9bbb10057', '0b4449e0-584d-4961-a563-c1e810791237', 'completed', '2026-04-08', '2026-05-05', '2026-07-31', '2026-07-31', 11000, 'month', 5000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('d773023d-b189-45ab-9df4-d294d2b05641', 'completed', 'b90c1067-aacd-45b5-81fe-587cf0be0250', 'completed');
INSERT INTO public.reviews (stay_id, listing_id, guest_id, rating, comment)
VALUES ('d773023d-b189-45ab-9df4-d294d2b05641', '0ed0cc6d-0101-479e-a989-d3c9bbb10057', '0b4449e0-584d-4961-a563-c1e810791237', 5, 'Amazing stay! Highly recommended.');

-- 7. Messaging and Notifications

INSERT INTO public.conversations (id, booking_id)
VALUES ('ff803830-c05c-4a67-8a1b-376406bf09dc', '854d9d75-f526-4dd4-8ca1-6ea6cfeebd98');

INSERT INTO public.messages (conversation_id, sender_id, content) VALUES
('ff803830-c05c-4a67-8a1b-376406bf09dc', 'e6cdb738-a0d3-433b-b961-465eaef6443b', 'Hi, I would like to book this place.'),
('ff803830-c05c-4a67-8a1b-376406bf09dc', '98a8feff-a602-44da-95ee-174663d14d64', 'Great! I will approve it shortly.');

INSERT INTO public.notifications (user_id, type, title, message) VALUES
('e6cdb738-a0d3-433b-b961-465eaef6443b', 'SYSTEM', 'Welcome to EliteStay', 'Complete your profile to get started.'),
('98a8feff-a602-44da-95ee-174663d14d64', 'BOOKING_REQUEST', 'New Request', 'You have a new booking request.');
