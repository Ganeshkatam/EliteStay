-- EliteStay V2 Seed Data

TRUNCATE public.messages, public.conversations, public.notifications, public.reviews, public.stay_events, public.stays, public.booking_events, public.bookings, public.listing_prices, public.listing_images, public.listing_build_progress, public.listing_amenities, public.listings, public.amenities, public.accommodation_types, public.user_preferences, public.profiles CASCADE;

DELETE FROM auth.users WHERE email LIKE '%@elitestay.com';
DELETE FROM auth.identities WHERE provider_id LIKE '%@elitestay.com';

-- 2. Auth Users & Profiles

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('37975738-bf71-40b2-a564-80db1fd24415', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","role":"admin"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '37975738-bf71-40b2-a564-80db1fd24415', format('{"sub":"%s","email":"%s"}', '37975738-bf71-40b2-a564-80db1fd24415', 'admin@elitestay.com')::jsonb, 'email', 'admin@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('ee2f3456-a19f-413d-8a08-885aa37f4d93', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jess Mann","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'ee2f3456-a19f-413d-8a08-885aa37f4d93', format('{"sub":"%s","email":"%s"}', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'host1@elitestay.com')::jsonb, 'email', 'host1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('2cf21820-99cc-4951-a593-53707f432cee', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Reva Zemlak","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '2cf21820-99cc-4951-a593-53707f432cee', format('{"sub":"%s","email":"%s"}', '2cf21820-99cc-4951-a593-53707f432cee', 'host2@elitestay.com')::jsonb, 'email', 'host2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('3f35db32-a734-4385-8a5d-0d6166dbfcdc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lena Anderson Jr.","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '3f35db32-a734-4385-8a5d-0d6166dbfcdc', format('{"sub":"%s","email":"%s"}', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'host3@elitestay.com')::jsonb, 'email', 'host3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('14bcc732-b2cb-42b8-ba45-95544bcee208', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Noah Thompson","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '14bcc732-b2cb-42b8-ba45-95544bcee208', format('{"sub":"%s","email":"%s"}', '14bcc732-b2cb-42b8-ba45-95544bcee208', 'guest1@elitestay.com')::jsonb, 'email', 'guest1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('d498ae74-72e3-418f-9804-86ec02132426', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Gregg Daniel","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'd498ae74-72e3-418f-9804-86ec02132426', format('{"sub":"%s","email":"%s"}', 'd498ae74-72e3-418f-9804-86ec02132426', 'guest2@elitestay.com')::jsonb, 'email', 'guest2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('eb5beea9-0558-40a8-9766-2a63712ad0b5', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kelley Johnston","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'eb5beea9-0558-40a8-9766-2a63712ad0b5', format('{"sub":"%s","email":"%s"}', 'eb5beea9-0558-40a8-9766-2a63712ad0b5', 'guest3@elitestay.com')::jsonb, 'email', 'guest3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('1c553287-9161-48b7-9a45-356301354b7d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest4@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Miss Shelley Anderson","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '1c553287-9161-48b7-9a45-356301354b7d', format('{"sub":"%s","email":"%s"}', '1c553287-9161-48b7-9a45-356301354b7d', 'guest4@elitestay.com')::jsonb, 'email', 'guest4@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('53a98601-561a-468f-8853-87343ac70ee2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest5@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mr. Merl Bednar","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '53a98601-561a-468f-8853-87343ac70ee2', format('{"sub":"%s","email":"%s"}', '53a98601-561a-468f-8853-87343ac70ee2', 'guest5@elitestay.com')::jsonb, 'email', 'guest5@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('a8b6e314-298a-4758-8140-d789350f6c4e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest6@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Edmund Jast","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'a8b6e314-298a-4758-8140-d789350f6c4e', format('{"sub":"%s","email":"%s"}', 'a8b6e314-298a-4758-8140-d789350f6c4e', 'guest6@elitestay.com')::jsonb, 'email', 'guest6@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('395e41e8-c1c9-47d2-8cca-894be784e1ff', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest7@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maurice Wunsch","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '395e41e8-c1c9-47d2-8cca-894be784e1ff', format('{"sub":"%s","email":"%s"}', '395e41e8-c1c9-47d2-8cca-894be784e1ff', 'guest7@elitestay.com')::jsonb, 'email', 'guest7@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('f03de09f-ea97-4b8e-b835-bf7e1088a81e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest8@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Columbus Runolfsson","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'f03de09f-ea97-4b8e-b835-bf7e1088a81e', format('{"sub":"%s","email":"%s"}', 'f03de09f-ea97-4b8e-b835-bf7e1088a81e', 'guest8@elitestay.com')::jsonb, 'email', 'guest8@elitestay.com', now(), now(), now());

-- 3. Override roles in profiles (since trigger defaults to guest)
UPDATE public.profiles SET role = 'admin' WHERE id = '37975738-bf71-40b2-a564-80db1fd24415';
UPDATE public.profiles SET role = 'host' WHERE id = 'ee2f3456-a19f-413d-8a08-885aa37f4d93';
UPDATE public.profiles SET role = 'host' WHERE id = '2cf21820-99cc-4951-a593-53707f432cee';
UPDATE public.profiles SET role = 'host' WHERE id = '3f35db32-a734-4385-8a5d-0d6166dbfcdc';

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

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('20fe762e-0ddc-4d4e-8d34-1f58c57de8b8', 'QPTGDTYX', '2cf21820-99cc-4951-a593-53707f432cee', 'vociferor ea amplitudo', 'Non depromo audax aggero aperte. Benigne veritas creator. Accedo tenetur congregatio viridis veniam vos alioqui.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '24597 Reynolds Field', 'S Oak Street', 'Bangalore', 'Karnataka', 'India', '59310', 'published', 12.991240677504324, 77.62278572533545);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('20fe762e-0ddc-4d4e-8d34-1f58c57de8b8', 29171, 'INR', 'month', 1040);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('13d565d3-bcea-49fa-970d-480007aa4e37', 'LY0MK0TW', '2cf21820-99cc-4951-a593-53707f432cee', 'tui ventito non', 'Ullus decipio demulceo tero timidus voluptates. Consequatur corrumpo quod infit dapifer beatus iure cohibeo. Virtus animus temperantia magni.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '6134 Connie Village', 'Nicolas Lodge', 'Mumbai', 'Maharashtra', 'India', '36983-0304', 'published', 19.110703994240506, 72.8683322893212);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('13d565d3-bcea-49fa-970d-480007aa4e37', 7988, 'INR', 'month', 2772);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('0151da1a-7fa7-4aba-b22f-f7176a7edb7c', 'ZEIDFORS', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'temeritas sto pel', 'Veniam cumque decet ab vinco stips cursim aranea. Trans minus vapulus vehemens eos quis. Depromo aperte toties nesciunt cedo cupressus crebro traho.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '421 Second Avenue', 'Denise Inlet', 'New Delhi', 'Delhi', 'India', '46928', 'published', 28.60239914395167, 77.22319667796617);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('0151da1a-7fa7-4aba-b22f-f7176a7edb7c', 5370, 'INR', 'month', 5918);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('538a3b6d-77f1-43ce-a439-fe6fea8300a0', 'VNZJVAX2', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'stultus acidus creo', 'Alias sperno ulterius quasi. Utroque angulus paens suggero thermae urbanus. Dolore vulgaris quam cohibeo cometes.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '40913 Salvador Manors', 'Bahringer Plaza', 'Hyderabad', 'Telangana', 'India', '18502', 'published', 17.39438660056657, 78.46901845334393);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('538a3b6d-77f1-43ce-a439-fe6fea8300a0', 5161, 'INR', 'month', 4653);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('25866fde-9602-4f35-82d9-05012c9a1082', 'JHBTIBT8', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'conitor sumo absorbeo', 'Aperte ago deripio curatio adfectus. Cura calco eius. Eaque addo tui torqueo cupiditate quia abscido adimpleo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '8197 W Franklin Street', 'Edwin Motorway', 'New Delhi', 'Delhi', 'India', '64949-9648', 'published', 28.581056065088433, 77.18524097237216);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('25866fde-9602-4f35-82d9-05012c9a1082', 13867, 'INR', 'month', 2092);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('2cae99bc-2859-4df9-a6e0-af7155de5175', 'U1VKBMIY', '2cf21820-99cc-4951-a593-53707f432cee', 'tempore adipisci cognomen', 'Tabgo vomer spiritus. Alioqui sunt paulatim celebrer. Voluptatem volutabrum corona minus ceno aut cuppedia.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '425 Bradtke Causeway', 'Iris Divide', 'New Delhi', 'Delhi', 'India', '17404-6540', 'published', 28.600913611325417, 77.21469836585626);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('2cae99bc-2859-4df9-a6e0-af7155de5175', 10668, 'INR', 'month', 4944);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('f4373557-5d34-44b3-b8a5-97bcb28c3f86', 'SLJDSAHP', '2cf21820-99cc-4951-a593-53707f432cee', 'reprehenderit quidem barba', 'Vorago tersus beatus aranea denuo utilis. Amplitudo textilis bibo bestia crastinus balbus cariosus acceptus certe. Adaugeo auctor thermae antepono urbs amoveo tego quis ullus cenaculum.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '64740 Deckow Mills', 'Cruickshank Throughway', 'Pune', 'Maharashtra', 'India', '47118-6194', 'published', 18.537331995838425, 73.83015899637834);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('f4373557-5d34-44b3-b8a5-97bcb28c3f86', 7699, 'INR', 'month', 4210);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('3e5b89e1-acfc-4e2e-8ad6-db8d74184e8a', 'VESIWMRB', '2cf21820-99cc-4951-a593-53707f432cee', 'armarium tempus depereo', 'Temperantia aut textus totidem. Animus vestigium decor non adeptio. Caste decens combibo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '2982 Beier Shore', 'Soledad Manor', 'Hyderabad', 'Telangana', 'India', '11728', 'published', 17.420794271815947, 78.49693458932926);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('3e5b89e1-acfc-4e2e-8ad6-db8d74184e8a', 28445, 'INR', 'month', 7628);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('015b29b3-bbcd-4ecb-b5dc-c5a4db9db4ce', 'WGCJMDLW', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'damnatio amicitia capitulus', 'Sapiente aut vomica crepusculum. Ascisco argentum ambulo adsum annus armarium auctor. Deorsum urbs stella aperte decipio quasi testimonium constans ustulo combibo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '7406 Daugherty Coves', 'Union Avenue', 'Mumbai', 'Maharashtra', 'India', '43979', 'published', 19.04706092874655, 72.87577757357083);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('015b29b3-bbcd-4ecb-b5dc-c5a4db9db4ce', 6082, 'INR', 'month', 6486);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('10cfaca9-bdc9-4327-a5cf-40d494ddc34c', 'EYYJS0Q0', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'crudelis delinquo demitto', 'Curo solvo cavus atavus maiores. Vix sapiente demens abundans arcesso bellicus. Apto validus delibero quaerat calco combibo eaque solitudo debeo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '57276 E 8th Street', 'Linda Spurs', 'Bangalore', 'Karnataka', 'India', '07343-1688', 'published', 12.935234350937405, 77.5576440471982);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('10cfaca9-bdc9-4327-a5cf-40d494ddc34c', 8427, 'INR', 'month', 1263);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('ebb797d6-1617-49a5-b857-530f0a595a93', 'NT34M8ND', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'infit colligo paulatim', 'Adicio taceo repudiandae beatus adipiscor ager vinco temeritas. Verumtamen absens tricesimus tricesimus depraedor dignissimos sum cupressus. Animus consectetur solutio vorax vitium compono.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '9332 McCullough Mission', 'Leatha Valleys', 'Mumbai', 'Maharashtra', 'India', '81978', 'published', 19.056340159052617, 72.91381030322131);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('ebb797d6-1617-49a5-b857-530f0a595a93', 17276, 'INR', 'month', 9986);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('468367bc-bc2e-4b38-85e9-47adb3fae4ac', '5PDQGWZE', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'decet curto animus', 'Creptio amita terreo cenaculum vigilo. Amiculum clamo agnosco cado cavus avaritia depono coerceo degenero conculco. Desidero curto cito chirographum sunt praesentium dicta adeptio ulciscor.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '6125 Hilton Burg', 'Chance Passage', 'Pune', 'Maharashtra', 'India', '97300-1691', 'published', 18.513874462983026, 73.84446457549237);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('468367bc-bc2e-4b38-85e9-47adb3fae4ac', 11165, 'INR', 'month', 2704);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('5fe1282f-d078-472a-9887-0617bd8cf61e', 'EBAGA03Q', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'utroque mollitia patruus', 'Aduro apud artificiose laborum voluptatum tum vapulus cavus arx tardus. Supellex argentum curiositas conventus certe ratione. Conservo tubineus comedo arca cogo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '924 Smith Park', 'Stanton Track', 'Bangalore', 'Karnataka', 'India', '71271', 'published', 12.992135001249613, 77.57613821816707);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('5fe1282f-d078-472a-9887-0617bd8cf61e', 13768, 'INR', 'month', 6571);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('ca21bf33-c120-4e52-9d5d-3ecba793b005', 'YKGQAOQR', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'ullus vulariter id', 'Asper voluptatum magnam curso alo nostrum voro aduro. Vaco itaque adfero charisma valens. Usus aveho vel torrens comedo expedita auctor.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '7649 Tyler Land', 'Ratke Island', 'Hyderabad', 'Telangana', 'India', '43915', 'published', 17.387521887320904, 78.49939171135043);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('ca21bf33-c120-4e52-9d5d-3ecba793b005', 27691, 'INR', 'month', 7481);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('6415afc1-aca0-4b49-ac82-a8ebe049e853', 'OFKHNNEB', '2cf21820-99cc-4951-a593-53707f432cee', 'crur cura catena', 'Tredecim adhaero amo tres. Tum dedecor qui corrupti cetera vulnus tersus tondeo. Cariosus conservo approbo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '1109 Alfred Street', 'Nia Common', 'Bangalore', 'Karnataka', 'India', '93433', 'published', 12.977986801786269, 77.63169839621006);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('6415afc1-aca0-4b49-ac82-a8ebe049e853', 23833, 'INR', 'month', 5295);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('bb06bef4-f78d-45be-a8ea-112ebeae2086', 'NZRS34XW', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'conatus cinis vito', 'Uterque terebro eos vae consectetur toties adimpleo caecus complectus. Admiratio convoco venustas temporibus pauper. Caste approbo timidus quaerat.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '808 Swaniawski Estate', 'Gutkowski Bypass', 'Mumbai', 'Maharashtra', 'India', '67595-9988', 'published', 19.04502134411407, 72.89316024661747);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('bb06bef4-f78d-45be-a8ea-112ebeae2086', 10055, 'INR', 'month', 6816);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('f6694328-4f9e-4398-adb0-9b74c374015e', '2N9EX65J', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'aestas mollitia stips', 'Cultura arcus summisse commemoro quidem cena solutio. Volup amicitia speculum commodi. Arguo quia audacia vester copiose.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '4839 St George''s Road', 'N Harrison Street', 'Hyderabad', 'Telangana', 'India', '15251', 'published', 17.35436038674133, 78.47917509760414);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('f6694328-4f9e-4398-adb0-9b74c374015e', 13235, 'INR', 'month', 6686);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('1deff109-7d54-4c35-bbe6-1149c92a0b90', 'LHYEF2HA', '2cf21820-99cc-4951-a593-53707f432cee', 'laboriosam sordeo tui', 'Vulticulus colo nisi curso socius. Soleo angelus adflicto tristis aptus contra caecus cuppedia velut sopor. Tumultus subnecto campana argumentum atrox copiose summisse.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '651 S Maple Street', 'Beach Road', 'Bangalore', 'Karnataka', 'India', '68552', 'published', 13.006981436763544, 77.57140791508795);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('1deff109-7d54-4c35-bbe6-1149c92a0b90', 18226, 'INR', 'month', 6824);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('d9febcec-9a4c-4611-a9f8-adba92272872', 'IOIM9MMJ', '2cf21820-99cc-4951-a593-53707f432cee', 'capto adduco bellum', 'Urbs contego supplanto depono aro studio aggero. Nulla cubo vitiosus terebro stips explicabo delibero. Dapifer laboriosam ocer creber commodi.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '2354 Crona Lights', 'Graciela Crossing', 'Hyderabad', 'Telangana', 'India', '51165', 'published', 17.41526276723108, 78.48481687159926);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('d9febcec-9a4c-4611-a9f8-adba92272872', 9702, 'INR', 'month', 3727);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('112c94ca-3f33-498f-9782-73df79b779b0', 'MZIG7LQZ', '2cf21820-99cc-4951-a593-53707f432cee', 'paulatim somniculosus esse', 'Cornu beneficium sui. Cohaero tunc tibi turpis dapifer sub acerbitas abduco viduo. Carcer cicuta caste curso celer est quas.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '9240 Thiel Meadow', 'Graham Vista', 'Pune', 'Maharashtra', 'India', '40316-4784', 'published', 18.519286660533268, 73.86777432987174);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('112c94ca-3f33-498f-9782-73df79b779b0', 15604, 'INR', 'month', 2374);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('ecdf907b-6459-4801-bfbe-ae8e424cda2f', 'ORQMNKCX', '2cf21820-99cc-4951-a593-53707f432cee', 'viriliter deprimo bonus', 'Ea auctus solum amor voluptate utroque explicabo porro architecto patior. Vicinus tricesimus sustineo vobis convoco cenaculum. Versus beatus amo alius adficio conservo solitudo adulatio acceptus canis.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '5115 Vicenta Prairie', 'Laurence Ranch', 'Bangalore', 'Karnataka', 'India', '46150', 'published', 12.980761503400911, 77.58944397238604);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('ecdf907b-6459-4801-bfbe-ae8e424cda2f', 25978, 'INR', 'month', 3216);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('3e714e6e-fc37-4e6a-a37e-a58b1105c7af', 'ZWXHAC5Y', '2cf21820-99cc-4951-a593-53707f432cee', 'torqueo cerno abbas', 'Stips acerbitas cuius solutio alii absconditus. Canonicus certe decumbo. Crux vito adamo conqueror solium vitium admitto.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '6178 Alexandre Forges', 'Paige Cove', 'Pune', 'Maharashtra', 'India', '18361', 'published', 18.549487144723958, 73.88954683568525);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('3e714e6e-fc37-4e6a-a37e-a58b1105c7af', 11084, 'INR', 'month', 1123);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('0781792b-f43a-4a7e-8202-519dc52a054b', 'Q59FSSGB', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'voluptatum carcer bonus', 'Vulnero aegre arto cum. Despecto aegrus eius video utrum corrigo admoneo doloremque. Vulnero consuasor amplus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '8303 Labadie Gardens', 'Bob Mountain', 'New Delhi', 'Delhi', 'India', '28932-7151', 'published', 28.619458020090857, 77.22380648844333);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('0781792b-f43a-4a7e-8202-519dc52a054b', 6991, 'INR', 'month', 3291);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('fb853612-821d-4523-b64a-db9dac95f2e5', 'RY9SKT6N', '2cf21820-99cc-4951-a593-53707f432cee', 'curto iure vitae', 'Carus commodo acidus cresco abbas. Colligo statim absconditus adsum. Cavus confugo odit architecto averto summisse.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '956 Bianka Manor', 'Erdman Point', 'Mumbai', 'Maharashtra', 'India', '40780', 'published', 19.099703164661115, 72.8554831588824);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('fb853612-821d-4523-b64a-db9dac95f2e5', 27346, 'INR', 'month', 3131);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('54e7e8ee-fda6-4291-9e05-a02a88999943', 'J7RB5VKD', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'vilicus paulatim adsuesco', 'Calamitas harum titulus usitas cognomen rerum laudantium utrum. Vilitas fugit recusandae amo maiores valeo et comes. Abstergo arbustum apparatus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '5488 N 4th Street', 'Douglas Pike', 'Pune', 'Maharashtra', 'India', '48223', 'published', 18.552356911887564, 73.86152844657613);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('54e7e8ee-fda6-4291-9e05-a02a88999943', 10329, 'INR', 'month', 1100);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('081d163d-c0f4-40a4-aa2d-196716a91351', 'IZYWVSPV', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'theologus dolorem civitas', 'Anser benigne somnus. Coruscus infit corporis. Claudeo apostolus vacuus tristis amplitudo ipsum alias acies.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '9546 W Broadway', 'Jonathon Plaza', 'New Delhi', 'Delhi', 'India', '20004-0845', 'published', 28.62113783485961, 77.18418738536138);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('081d163d-c0f4-40a4-aa2d-196716a91351', 9728, 'INR', 'month', 1058);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('3c7de61b-b994-4905-8cda-6a10330d2316', 'W93JKSE8', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'suasoria quas vomer', 'Adhuc sufficio supplanto denique perferendis quibusdam ullus confero cibo. Tepidus pecto cresco quas defungo cupiditate. Auxilium tribuo repellendus triumphus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '1714 Koepp-Tillman Streets', 'Madison Avenue', 'Pune', 'Maharashtra', 'India', '54902-2084', 'published', 18.515850253098215, 73.85264295691422);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('3c7de61b-b994-4905-8cda-6a10330d2316', 5940, 'INR', 'month', 1714);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('7df201b0-97fd-4d58-a2c6-776d912b3e4f', '5EOBKN9R', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'contigo comes candidus', 'Ver quisquam rem vesica cognomen auctor tenus cuppedia custodia vulgivagus. Excepturi corpus stella tabernus turba traho taedium. Arguo caelestis vitium accendo desino.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '93319 S Park Street', 'Daniel Island', 'Mumbai', 'Maharashtra', 'India', '28974', 'published', 19.075851736945882, 72.8809522537901);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('7df201b0-97fd-4d58-a2c6-776d912b3e4f', 23789, 'INR', 'month', 6983);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('95cdabb4-357e-4533-bba5-0a7cb97b4580', 'UKA83KBB', '2cf21820-99cc-4951-a593-53707f432cee', 'sit unde esse', 'Aro timidus speciosus amo stillicidium cado aggredior nostrum somniculosus corpus. Creber coniuratio cuppedia vulgus. Fugit decumbo celebrer claro agnitio denuo tener virtus calamitas.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '430 Quarry Lane', 'Middle Street', 'Mumbai', 'Maharashtra', 'India', '49710', 'published', 19.08666818564398, 72.85579619969269);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('95cdabb4-357e-4533-bba5-0a7cb97b4580', 24221, 'INR', 'month', 4432);

INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('fd93936e-5e61-4027-8f86-62a37ffa9b6b', 'NYK9DM27', '2cf21820-99cc-4951-a593-53707f432cee', 'curto vere subiungo', 'Debeo studio subito. Audio magni mollitia audax caste tamen pecus sodalitas ulterius. Aequitas dolores vereor tristis abutor eius crapula caecus illo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '825 E 14th Street', 'E 3rd Street', 'Bangalore', 'Karnataka', 'India', '86062', 'published', 12.955021161816491, 77.62429773933563);
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('fd93936e-5e61-4027-8f86-62a37ffa9b6b', 15513, 'INR', 'month', 3623);

-- 6. Bookings and Stays

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('53351102-ca92-4c67-beaf-1490f9a0da9e', '20fe762e-0ddc-4d4e-8d34-1f58c57de8b8', '14bcc732-b2cb-42b8-ba45-95544bcee208', '2026-08-02', 3, 'pending', 10000, 5000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('53351102-ca92-4c67-beaf-1490f9a0da9e', 'request_created', '14bcc732-b2cb-42b8-ba45-95544bcee208', 'pending');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('048c6894-f127-4c94-a64d-c1203a4466cf', '13d565d3-bcea-49fa-970d-480007aa4e37', 'd498ae74-72e3-418f-9804-86ec02132426', '2026-08-02', 3, 'approved', 12000, 6000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('048c6894-f127-4c94-a64d-c1203a4466cf', 'request_created', 'd498ae74-72e3-418f-9804-86ec02132426', 'pending');
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('048c6894-f127-4c94-a64d-c1203a4466cf', 'approved', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'pending', 'approved');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('1e0c73d3-057c-4a8e-89d9-514e7c234f48', '0151da1a-7fa7-4aba-b22f-f7176a7edb7c', 'eb5beea9-0558-40a8-9766-2a63712ad0b5', '2026-08-01', 3, 'rejected', 8000, 4000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('1e0c73d3-057c-4a8e-89d9-514e7c234f48', 'rejected', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'pending', 'rejected');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('9422da7d-6371-4d98-a37e-33048549a767', '538a3b6d-77f1-43ce-a439-fe6fea8300a0', '1c553287-9161-48b7-9a45-356301354b7d', '2026-08-01', 3, 'approved', 15000, 7000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('6e416249-ff29-4345-a666-1036e6558153', '9422da7d-6371-4d98-a37e-33048549a767', '538a3b6d-77f1-43ce-a439-fe6fea8300a0', '1c553287-9161-48b7-9a45-356301354b7d', 'active', '2026-07-31', '2026-08-01', '2026-10-31', 15000, 'month', 7000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('6e416249-ff29-4345-a666-1036e6558153', 'active', '2cf21820-99cc-4951-a593-53707f432cee', 'active');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('4b08060e-2b2e-4251-8b36-05c65451a8a6', '25866fde-9602-4f35-82d9-05012c9a1082', '53a98601-561a-468f-8853-87343ac70ee2', '2026-07-14', 3, 'approved', 11000, 5000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, actual_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('72f4cf88-0a71-4310-8f6d-f867ed146d38', '4b08060e-2b2e-4251-8b36-05c65451a8a6', '25866fde-9602-4f35-82d9-05012c9a1082', '53a98601-561a-468f-8853-87343ac70ee2', 'completed', '2026-01-04', '2025-10-09', '2026-08-01', '2026-08-01', 11000, 'month', 5000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('72f4cf88-0a71-4310-8f6d-f867ed146d38', 'completed', '3f35db32-a734-4385-8a5d-0d6166dbfcdc', 'completed');
INSERT INTO public.reviews (stay_id, listing_id, guest_id, rating, comment)
VALUES ('72f4cf88-0a71-4310-8f6d-f867ed146d38', '25866fde-9602-4f35-82d9-05012c9a1082', '53a98601-561a-468f-8853-87343ac70ee2', 5, 'Amazing stay! Highly recommended.');

-- 7. Messaging and Notifications

INSERT INTO public.conversations (id, booking_id)
VALUES ('a03c6fa0-0a52-41b5-bae1-d2b5d4a294bd', '53351102-ca92-4c67-beaf-1490f9a0da9e');

INSERT INTO public.messages (conversation_id, sender_id, content) VALUES
('a03c6fa0-0a52-41b5-bae1-d2b5d4a294bd', '14bcc732-b2cb-42b8-ba45-95544bcee208', 'Hi, I would like to book this place.'),
('a03c6fa0-0a52-41b5-bae1-d2b5d4a294bd', 'ee2f3456-a19f-413d-8a08-885aa37f4d93', 'Great! I will approve it shortly.');

INSERT INTO public.notifications (user_id, type, title, message) VALUES
('14bcc732-b2cb-42b8-ba45-95544bcee208', 'SYSTEM', 'Welcome to EliteStay', 'Complete your profile to get started.'),
('ee2f3456-a19f-413d-8a08-885aa37f4d93', 'BOOKING_REQUEST', 'New Request', 'You have a new booking request.');
