-- EliteStay V2 Seed Data

TRUNCATE public.messages, public.conversations, public.notifications, public.reviews, public.stay_events, public.stays, public.booking_events, public.bookings, public.listing_prices, public.listing_images, public.listing_build_progress, public.listing_amenities, public.listings, public.amenities, public.accommodation_types, public.user_preferences, public.profiles CASCADE;

DELETE FROM auth.users WHERE email LIKE '%@elitestay.com';
DELETE FROM auth.identities WHERE provider_id LIKE '%@elitestay.com';

-- 2. Auth Users & Profiles

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('18060cab-9ca2-49d3-bc5e-fce49642170f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","role":"admin"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '18060cab-9ca2-49d3-bc5e-fce49642170f', format('{"sub":"%s","email":"%s"}', '18060cab-9ca2-49d3-bc5e-fce49642170f', 'admin@elitestay.com')::jsonb, 'email', 'admin@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('cbab26da-b2e9-4e64-8955-6c491130d9e3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marilyne Bashirian","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'cbab26da-b2e9-4e64-8955-6c491130d9e3', format('{"sub":"%s","email":"%s"}', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'host1@elitestay.com')::jsonb, 'email', 'host1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('2942f025-7271-4c1e-a9fe-6675fbf5fafb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Colleen Lemke-Jacobson III","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '2942f025-7271-4c1e-a9fe-6675fbf5fafb', format('{"sub":"%s","email":"%s"}', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'host2@elitestay.com')::jsonb, 'email', 'host2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('d7716e2a-ac8f-43b3-9036-1dbc00c29fdc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Claude Padberg","role":"host"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', format('{"sub":"%s","email":"%s"}', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'host3@elitestay.com')::jsonb, 'email', 'host3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('11f464e6-b883-4b6e-bb30-965a46f7bc5c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest1@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Thomas Thiel","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '11f464e6-b883-4b6e-bb30-965a46f7bc5c', format('{"sub":"%s","email":"%s"}', '11f464e6-b883-4b6e-bb30-965a46f7bc5c', 'guest1@elitestay.com')::jsonb, 'email', 'guest1@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('29d918df-303e-49e7-a6c8-25484975957d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest2@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Blanca Howe","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '29d918df-303e-49e7-a6c8-25484975957d', format('{"sub":"%s","email":"%s"}', '29d918df-303e-49e7-a6c8-25484975957d', 'guest2@elitestay.com')::jsonb, 'email', 'guest2@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('028c999c-d632-4400-98bd-a7d780e026bb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest3@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Howell McClure","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '028c999c-d632-4400-98bd-a7d780e026bb', format('{"sub":"%s","email":"%s"}', '028c999c-d632-4400-98bd-a7d780e026bb', 'guest3@elitestay.com')::jsonb, 'email', 'guest3@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('59021e9d-99c9-4068-bca7-3d59f8b7a903', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest4@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kathy Brown","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '59021e9d-99c9-4068-bca7-3d59f8b7a903', format('{"sub":"%s","email":"%s"}', '59021e9d-99c9-4068-bca7-3d59f8b7a903', 'guest4@elitestay.com')::jsonb, 'email', 'guest4@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('0335d5f7-0788-4ce6-a851-4a0962234a9e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest5@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kristie Miller II","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '0335d5f7-0788-4ce6-a851-4a0962234a9e', format('{"sub":"%s","email":"%s"}', '0335d5f7-0788-4ce6-a851-4a0962234a9e', 'guest5@elitestay.com')::jsonb, 'email', 'guest5@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('4f9d6bf3-3780-4e6d-8572-1fa1d20711f1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest6@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Gina Maggio","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '4f9d6bf3-3780-4e6d-8572-1fa1d20711f1', format('{"sub":"%s","email":"%s"}', '4f9d6bf3-3780-4e6d-8572-1fa1d20711f1', 'guest6@elitestay.com')::jsonb, 'email', 'guest6@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('8aa20748-531c-4d15-8385-90f67a32f524', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest7@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanner Nikolaus","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '8aa20748-531c-4d15-8385-90f67a32f524', format('{"sub":"%s","email":"%s"}', '8aa20748-531c-4d15-8385-90f67a32f524', 'guest7@elitestay.com')::jsonb, 'email', 'guest7@elitestay.com', now(), now(), now());

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('2e773dd4-4c14-4f43-b145-7277c879a32a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest8@elitestay.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ms. Paula Abernathy","role":"guest"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '2e773dd4-4c14-4f43-b145-7277c879a32a', format('{"sub":"%s","email":"%s"}', '2e773dd4-4c14-4f43-b145-7277c879a32a', 'guest8@elitestay.com')::jsonb, 'email', 'guest8@elitestay.com', now(), now(), now());

-- 3. Override roles in profiles (since trigger defaults to guest)
UPDATE public.profiles SET role = 'admin' WHERE id = '18060cab-9ca2-49d3-bc5e-fce49642170f';
UPDATE public.profiles SET role = 'host' WHERE id = 'cbab26da-b2e9-4e64-8955-6c491130d9e3';
UPDATE public.profiles SET role = 'host' WHERE id = '2942f025-7271-4c1e-a9fe-6675fbf5fafb';
UPDATE public.profiles SET role = 'host' WHERE id = 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc';

-- 4. Accommodation Types and Amenities
INSERT INTO public.accommodation_types (id, name, description, slug) VALUES 
(gen_random_uuid(), 'PG', 'Paying Guest Accommodation', 'pg'),
(gen_random_uuid(), 'Apartment', 'Full Apartment', 'apartment'),
(gen_random_uuid(), 'Hostel', 'Shared Hostel', 'hostel'),
(gen_random_uuid(), 'Coliving', 'Co-living space', 'coliving'),
(gen_random_uuid(), 'Student Housing', 'Housing for students', 'student-housing');

INSERT INTO public.amenities (id, name, icon_name, category) VALUES 
(gen_random_uuid(), 'WiFi', 'wifi', 'Essentials'),
(gen_random_uuid(), 'Air Conditioning', 'snowflake', 'Comfort'),
(gen_random_uuid(), 'Kitchen', 'kitchen', 'Essentials'),
(gen_random_uuid(), 'Parking', 'parking', 'Facilities'),
(gen_random_uuid(), 'Pool', 'pool', 'Facilities'),
(gen_random_uuid(), 'Gym', 'dumbbell', 'Facilities');

-- 5. Listings

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('5041de5a-804f-4b79-891e-17a7086dc35c', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'despecto adulescens coniecto', 'Soleo tres concido comedo natus consequatur uredo placeat tergeo averto. Absorbeo magni verbera cognatus coepi amplexus provident congregatio. Tutis absum umerus ademptio tondeo bene debilito alienus claro comburo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 627, 459, 'published', '3602 Kian Junctions', 'East Rigobertostead', 'Pennsylvania', 'USA', '64933-9513');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('ee3692a1-bf49-4632-89a4-45a662ffab09', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'curo unde sufficio', 'Atrocitas dolorum certe. Agnosco aut cena stillicidium eligendi statim. Cohibeo creator arx theatrum trado.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1772, 199, 'published', '633 Kling Harbor', 'Killeen', 'Nebraska', 'USA', '43006');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('f3b64bd5-ee8a-4309-9360-2a415d45905f', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'quae solum alioqui', 'Textilis cilicium temeritas cornu degusto valetudo socius vulgaris tyrannus. Cui consequuntur triumphus cernuus abscido denego tristis necessitatibus utique tergo. Nulla demens carus virgo tepidus repudiandae comitatus distinctio.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2102, 154, 'published', '2409 Lake Road', 'Rollinstead', 'California', 'USA', '21246');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('7428328a-7576-41ae-b842-a41860a49716', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'xiphias cicuta subiungo', 'Speciosus admoneo vapulus absconditus casso quia cui patrocinor capillus. Subito somnus advenio tres adsidue theologus recusandae. Molestiae textor defaeco venia ocer.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1685, 805, 'published', '2766 Princess Coves', 'Janfield', 'North Carolina', 'USA', '44988');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('cb23dfd6-deb1-4ee4-8d50-69bb825d64bb', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'necessitatibus sordeo tabernus', 'Thymbra substantia depopulo tenetur vacuus antiquus auctor termes debitis. Vinculum sufficio cernuus subvenio ara decor. Omnis abstergo vinculum aro eum attollo arto calamitas versus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2898, 240, 'published', '154 Shelly Cove', 'North Warrenborough', 'New Jersey', 'USA', '06808-2351');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('a6634f43-7df0-42fc-9315-f50fac7f0684', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'valde caute compono', 'Tolero supplanto vesica terra creptio. Debilito tonsor deprecator voluptatem adeo ulciscor convoco aiunt sumo atavus. Adeptio timidus clamo adnuo dolores utrum venio tredecim exercitationem delego.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 842, 936, 'published', '37798 Laron Union', 'Lake Reid', 'Illinois', 'USA', '59294-0834');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('74d91b4e-9cea-4bc9-a255-d4af34edcf71', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'tui crepusculum textus', 'Trado canto coerceo. Paens aliquid utrimque tener truculenter. Molestias sperno sollers pauci corpus aeneus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1597, 770, 'published', '502 The Grove', 'West Angelinafort', 'Illinois', 'USA', '46853-0566');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('f2cb717f-48ed-4475-b54a-4595f37b2baa', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'dedecor sublime tepesco', 'Bestia vulgus infit molestias tricesimus conicio curto cibus iure. Utilis sperno adstringo candidus verecundia verus. Eum quod synagoga utrimque.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1720, 844, 'published', '5169 Guy Drive', 'Tulsa', 'Virginia', 'USA', '03304-9265');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('5bc6eb64-53ea-4eeb-8b5b-f92a4519feed', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'usus tamisium amo', 'Aptus animi tonsor. Benevolentia tubineus somnus ustilo sortitus voro adhuc caries consequatur. Tempore cumque stipes.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1016, 174, 'published', '62035 Elm Close', 'West Cristophermouth', 'Georgia', 'USA', '76179-5915');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('46c32b23-a1a9-4852-9052-b5b664d81c2c', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'communis utrimque synagoga', 'Corrumpo cura corroboro cedo atavus via. Solvo sufficio allatus versus ratione cresco voluptate timor. Turbo victoria tero aiunt temperantia debeo sufficio audax.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2777, 620, 'published', '41816 Kayla Crossroad', 'Jefferson City', 'Montana', 'USA', '90564');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('e3716e58-4eb0-4ecc-ac7b-e8f597cf9d19', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'arx enim uredo', 'Cerno audax damno sublime aequitas vulgus cognatus thema. Eligendi talio vorago thema. Libero barba voro culpa.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2938, 119, 'published', '5688 S Main Avenue', 'Victoriashire', 'North Carolina', 'USA', '77596');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('c1c838b2-b493-4140-a172-3df859a5881c', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'dolores omnis decumbo', 'Cruentus terebro delinquo voluptatum aqua tergiversatio crustulum demulceo tergiversatio defetiscor. Tutamen auditor voluptates defluo. Substantia ater spiritus videlicet tripudio.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 834, 649, 'published', '685 Thompson Meadows', 'Cooperfurt', 'Louisiana', 'USA', '26226');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('8b5bfa90-3f2c-4c42-b8b5-4efabd3bb852', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'turpis verbera turba', 'Pariatur debeo traho summisse artificiose acies trucido acsi dens cimentarius. Xiphias uberrime vomica asperiores aliquam tenax coniuratio summa terreo curriculum. Consequatur demum allatus virga uter uredo utique.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1088, 108, 'published', '438 Baumbach Isle', 'Port Daisha', 'Michigan', 'USA', '22976-0232');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('0efd705e-3003-4d53-a96c-4725a6062d98', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'iste decimus sonitus', 'Conspergo bardus aqua thorax carbo vesco tamisium admitto. Tabgo valens video compono tener sperno patior aspicio. Quidem cupressus aetas degenero celo.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 675, 544, 'published', '561 Castle Close', 'Wuckerthaven', 'South Carolina', 'USA', '32695-0850');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('37622ea0-1ebd-4834-bf3f-c32e18dc3ce9', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'amicitia timidus amitto', 'Nulla cetera acies tametsi. Rerum exercitationem villa asper aggero nihil vociferor ago. Optio tutis allatus bis uter cariosus.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 750, 931, 'published', '655 Hoppe Shores', 'South Arturoworth', 'New Hampshire', 'USA', '33382');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('d6fd7779-cdcb-4ac3-b5b6-002aff49bf7c', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'absum repellendus ratione', 'Patior vespillo tredecim cultellus debitis damno conscendo. Strues arbustum ullus vito terebro cattus ager repudiandae tres ex. Adnuo incidunt solvo patior tristis.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 604, 590, 'published', '49800 Alexandra Road', 'Modesto', 'Florida', 'USA', '30373-7677');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('1d7906de-d7d6-4746-85f1-60ca085bb2c9', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'animadverto creo absum', 'Natus suggero adulatio coaegresco careo volaticus. Subito animus teneo pecto demulceo dolorum solvo corpus coma. Tempore patria degusto.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 1012, 743, 'published', '97845 Friesen Place', 'Coachella', 'Nevada', 'USA', '94006-9682');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('be6ffd3d-d482-4212-bad5-832a5b25d6b0', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'voluptates theologus decens', 'Deprimo concedo candidus patior celer abstergo civitas in. Utique infit congregatio cruentus sequi ex cunae. Cubo caries clam.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2151, 745, 'published', '34545 Church Walk', 'Kansas City', 'Florida', 'USA', '24977-1254');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('9c56ade0-2bab-430a-aafc-abc6bb64416e', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'addo officiis beatus', 'Quam modi facere. Temptatio rerum adiuvo suffoco theologus depono repellat nihil terror. Vesica tenus ut velit.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 2163, 104, 'published', '31313 Cruickshank Rest', 'Ephraimhaven', 'Georgia', 'USA', '23694-1127');

INSERT INTO public.listings (id, host_id, title, description, accommodation_type_id, monthly_price, security_deposit, status, address_line1, city, state, country, zip_code)
VALUES ('3c5f8a64-c4aa-49e6-9b9a-b784e37d9ba2', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'atqui aperio denuo', 'Color amplus verto tricesimus nam aegre tamquam. Cogito sui clam vero arx carcer vivo crustulum. Rerum vero animi.', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), 892, 530, 'published', '3287 S Jefferson Street', 'East Honolulu', 'Arizona', 'USA', '23695-6313');

-- 6. Bookings and Stays

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, status, snapshot_monthly_rent, snapshot_security_deposit)
VALUES ('4ef4cc8c-aed7-4eb7-8094-98956c2ef459', '5041de5a-804f-4b79-891e-17a7086dc35c', '11f464e6-b883-4b6e-bb30-965a46f7bc5c', '2026-08-01', 'pending', 1000, 500);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('4ef4cc8c-aed7-4eb7-8094-98956c2ef459', 'request_created', '11f464e6-b883-4b6e-bb30-965a46f7bc5c', 'pending');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, status, snapshot_monthly_rent, snapshot_security_deposit)
VALUES ('2a65aed5-19f7-48bf-a62a-4c2ebca75240', 'ee3692a1-bf49-4632-89a4-45a662ffab09', '29d918df-303e-49e7-a6c8-25484975957d', '2026-08-01', 'approved', 1200, 600);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('2a65aed5-19f7-48bf-a62a-4c2ebca75240', 'request_created', '29d918df-303e-49e7-a6c8-25484975957d', 'pending');
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('2a65aed5-19f7-48bf-a62a-4c2ebca75240', 'approved', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'pending', 'approved');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, status, snapshot_monthly_rent, snapshot_security_deposit)
VALUES ('89a286c0-990c-4132-95fa-706993562a14', 'f3b64bd5-ee8a-4309-9360-2a415d45905f', '028c999c-d632-4400-98bd-a7d780e026bb', '2026-08-01', 'rejected', 800, 400);
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('89a286c0-990c-4132-95fa-706993562a14', 'rejected', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'pending', 'rejected');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, status, snapshot_monthly_rent, snapshot_security_deposit)
VALUES ('35ccf0eb-5eda-4cc8-aaf0-ff2c6118da3f', '7428328a-7576-41ae-b842-a41860a49716', '59021e9d-99c9-4068-bca7-3d59f8b7a903', '2026-07-31', 'approved', 1500, 700);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, actual_move_in_date, current_monthly_rent)
VALUES ('d6b8c173-2b4f-4107-a4d7-f3fc7a67955f', '35ccf0eb-5eda-4cc8-aaf0-ff2c6118da3f', '7428328a-7576-41ae-b842-a41860a49716', '59021e9d-99c9-4068-bca7-3d59f8b7a903', 'active', '2026-07-31', 1500);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('d6b8c173-2b4f-4107-a4d7-f3fc7a67955f', 'active', '2942f025-7271-4c1e-a9fe-6675fbf5fafb', 'active');

INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, status, snapshot_monthly_rent, snapshot_security_deposit)
VALUES ('e53c40d0-a79e-4c87-8331-48403904087f', 'cb23dfd6-deb1-4ee4-8d50-69bb825d64bb', '0335d5f7-0788-4ce6-a851-4a0962234a9e', '2025-08-09', 'approved', 1100, 500);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, actual_move_in_date, actual_move_out_date, current_monthly_rent)
VALUES ('1bce8039-389c-4fa5-ad43-605e439f9503', 'e53c40d0-a79e-4c87-8331-48403904087f', 'cb23dfd6-deb1-4ee4-8d50-69bb825d64bb', '0335d5f7-0788-4ce6-a851-4a0962234a9e', 'completed', '2025-10-29', '2026-07-31', 1100);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('1bce8039-389c-4fa5-ad43-605e439f9503', 'completed', 'd7716e2a-ac8f-43b3-9036-1dbc00c29fdc', 'completed');
INSERT INTO public.reviews (stay_id, listing_id, guest_id, rating, comment)
VALUES ('1bce8039-389c-4fa5-ad43-605e439f9503', 'cb23dfd6-deb1-4ee4-8d50-69bb825d64bb', '0335d5f7-0788-4ce6-a851-4a0962234a9e', 5, 'Amazing stay! Highly recommended.');

-- 7. Messaging and Notifications

INSERT INTO public.conversations (id, listing_id, participant_one_id, participant_two_id)
VALUES ('54f44838-cc2f-4307-977f-f629f86fcfb7', '5041de5a-804f-4b79-891e-17a7086dc35c', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', '11f464e6-b883-4b6e-bb30-965a46f7bc5c');

INSERT INTO public.messages (conversation_id, sender_id, content) VALUES
('54f44838-cc2f-4307-977f-f629f86fcfb7', '11f464e6-b883-4b6e-bb30-965a46f7bc5c', 'Hi, I would like to book this place.'),
('54f44838-cc2f-4307-977f-f629f86fcfb7', 'cbab26da-b2e9-4e64-8955-6c491130d9e3', 'Great! I will approve it shortly.');

INSERT INTO public.notifications (user_id, type, title, message) VALUES
('11f464e6-b883-4b6e-bb30-965a46f7bc5c', 'SYSTEM', 'Welcome to EliteStay', 'Complete your profile to get started.'),
('cbab26da-b2e9-4e64-8955-6c491130d9e3', 'BOOKING_REQUEST', 'New Request', 'You have a new booking request.');
