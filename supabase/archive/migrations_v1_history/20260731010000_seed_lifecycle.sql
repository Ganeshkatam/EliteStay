-- 20260731010000_seed_lifecycle.sql

DO $$ 
DECLARE
  -- Hosts
  host1 UUID := gen_random_uuid();
  host2 UUID := gen_random_uuid();
  host3 UUID := gen_random_uuid();

  -- Listing Types
  type_apt UUID;
  type_villa UUID;
  type_cabin UUID;
  type_beach UUID;
  type_farm UUID;
  type_hotel UUID;
  type_hostel UUID;
  type_homestay UUID;

  -- Amenities
  am_wifi UUID;
  am_pool UUID;
  am_kitchen UUID;
  am_ac UUID;
  am_parking UUID;
  am_tv UUID;
  am_washer UUID;

  -- Listings
  list1 UUID;
  list2 UUID;
  list3 UUID;
  list4 UUID;
  list5 UUID;
  list6 UUID;
  list7 UUID;
  list8 UUID;
  list9 UUID;
  list10 UUID;
BEGIN
  -----------------------------------------------------------------------------
  -- 1. Create Hosts
  -----------------------------------------------------------------------------
  SELECT id INTO host1 FROM auth.users WHERE email = 'host1@example.com' LIMIT 1;
  IF host1 IS NULL THEN
    host1 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', host1, 'authenticated', 'authenticated', 'host1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins"}', NOW(), NOW());
  END IF;

  SELECT id INTO host2 FROM auth.users WHERE email = 'host2@example.com' LIMIT 1;
  IF host2 IS NULL THEN
    host2 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', host2, 'authenticated', 'authenticated', 'host2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Michael Chen"}', NOW(), NOW());
  END IF;

  SELECT id INTO host3 FROM auth.users WHERE email = 'host3@example.com' LIMIT 1;
  IF host3 IS NULL THEN
    host3 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', host3, 'authenticated', 'authenticated', 'host3@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Rodriguez"}', NOW(), NOW());
  END IF;

  -- Update profiles to host
  ALTER TABLE public.profiles DISABLE TRIGGER enforce_profile_immutability;
  UPDATE public.profiles SET role = 'host'::user_role WHERE id IN (host1, host2, host3);
  ALTER TABLE public.profiles ENABLE TRIGGER enforce_profile_immutability;

  -----------------------------------------------------------------------------
  -- 2. Fetch Existing Listing Types and Amenities 
  -- (Assuming they were not dropped or were re-seeded, but they were not dropped in the previous migration!)
  -----------------------------------------------------------------------------
  SELECT id INTO type_apt FROM public.listing_types WHERE name = 'Apartment' LIMIT 1;
  SELECT id INTO type_villa FROM public.listing_types WHERE name = 'Villa' LIMIT 1;
  SELECT id INTO type_cabin FROM public.listing_types WHERE name = 'Cabin' LIMIT 1;
  SELECT id INTO type_beach FROM public.listing_types WHERE name = 'Beach House' LIMIT 1;
  SELECT id INTO type_farm FROM public.listing_types WHERE name = 'Farm Stay' LIMIT 1;
  SELECT id INTO type_hotel FROM public.listing_types WHERE name = 'Hotel Room' LIMIT 1;
  SELECT id INTO type_hostel FROM public.listing_types WHERE name = 'Hostel' LIMIT 1;
  SELECT id INTO type_homestay FROM public.listing_types WHERE name = 'Homestay' LIMIT 1;

  SELECT id INTO am_wifi FROM public.amenities WHERE name = 'WiFi' LIMIT 1;
  SELECT id INTO am_pool FROM public.amenities WHERE name = 'Pool' LIMIT 1;
  SELECT id INTO am_kitchen FROM public.amenities WHERE name = 'Kitchen' LIMIT 1;
  SELECT id INTO am_ac FROM public.amenities WHERE name = 'Air Conditioning' LIMIT 1;
  SELECT id INTO am_parking FROM public.amenities WHERE name = 'Free Parking' LIMIT 1;
  SELECT id INTO am_tv FROM public.amenities WHERE name = 'TV' LIMIT 1;
  SELECT id INTO am_washer FROM public.amenities WHERE name = 'Washer' LIMIT 1;


  -----------------------------------------------------------------------------
  -- 4. Create Listings (With new lifecycle fields, max_occupants instead of max_guests)
  -----------------------------------------------------------------------------
  
  -- Listing 1: Apartment (Monthly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_apt, 'Cozy Downtown Studio', 'A perfect compact space for urban living. Ideal for young professionals.', 2, 'US', 'USA', 'NY', 'New York', 'New York, NY', 'published')
  RETURNING id INTO list1;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list1, 2500.00, 'USD', 'month', 2500.00, 3); -- Minimum 3 months
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list1, am_wifi), (list1, am_kitchen), (list1, am_ac);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list1, CURRENT_DATE, 1);

  -- Listing 2: Apartment (Monthly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_apt, 'Modern City View Flat', 'Stunning skyline views in a prime location. Great for corporate relocations.', 4, 'US', 'USA', 'IL', 'Chicago', 'Chicago, IL', 'published')
  RETURNING id INTO list2;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, maintenance_fee, minimum_duration) 
  VALUES (list2, 4200.00, 'USD', 'month', 4200.00, 150.00, 6); -- Minimum 6 months
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list2, 'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list2, am_wifi), (list2, am_ac), (list2, am_tv);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list2, CURRENT_DATE + INTERVAL '15 days', 1);

  -- Listing 3: Villa (Weekly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_villa, 'Mediterranean Serenity Villa', 'A sprawling estate with a private pool. Bookable by the week for extended retreats.', 8, 'GR', 'Greece', 'South Aegean', 'Santorini', 'Santorini, Greece', 'published')
  RETURNING id INTO list3;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list3, 3500.00, 'USD', 'week', 1000.00, 2); -- Minimum 2 weeks
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list3, am_wifi), (list3, am_pool), (list3, am_parking), (list3, am_ac);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list3, CURRENT_DATE, 1);

  -- Listing 4: Cabin (Daily)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host3, type_cabin, 'Rustic Pine Cabin', 'Escape to the mountains. Perfect for short getaways or focused remote work.', 4, 'US', 'USA', 'CO', 'Aspen', 'Aspen, CO', 'published')
  RETURNING id INTO list4;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, minimum_duration) 
  VALUES (list4, 150.00, 'USD', 'day', 3); -- Minimum 3 days
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list4, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list4, am_parking), (list4, am_kitchen);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list4, CURRENT_DATE, 1);

  -- Listing 5: Beach House (Monthly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_beach, 'Oceanfront Paradise', 'Step directly from your patio onto pristine white sands. Available for seasonal leases.', 6, 'US', 'USA', 'CA', 'Malibu', 'Malibu, CA', 'published')
  RETURNING id INTO list5;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list5, 12000.00, 'USD', 'month', 12000.00, 1); -- Minimum 1 month
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list5, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list5, am_wifi), (list5, am_kitchen), (list5, am_parking), (list5, am_washer);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list5, CURRENT_DATE + INTERVAL '1 month', 1);

  -- Listing 6: Beach House (Draft)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host3, type_beach, 'Sunset Beach Cottage', 'A charming cottage undergoing renovations.', 4, 'US', 'USA', 'FL', 'Miami', 'Miami, FL', 'draft')
  RETURNING id INTO list6;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, minimum_duration) 
  VALUES (list6, 3500.00, 'USD', 'month', 1);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list6, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list6, CURRENT_DATE, 1);

  -- Listing 7: Farm Stay (Semester)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_farm, 'Historic Vineyard Estate', 'Stay on a working vineyard for a cultural exchange semester.', 12, 'IT', 'Italy', 'Tuscany', 'Florence', 'Tuscany, Italy', 'published')
  RETURNING id INTO list7;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list7, 5000.00, 'EUR', 'semester', 1000.00, 1); -- Minimum 1 semester
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list7, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list7, am_parking), (list7, am_kitchen), (list7, am_washer);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list7, CURRENT_DATE, 1);

  -- Listing 8: Hotel Room (Daily)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_hotel, 'Boutique Hotel King Suite', 'Spacious suite in the historic district.', 2, 'FR', 'France', 'Ile-de-France', 'Paris', 'Paris, France', 'published')
  RETURNING id INTO list8;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, minimum_duration) 
  VALUES (list8, 280.00, 'EUR', 'day', 1); -- Minimum 1 day
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list8, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list8, am_wifi), (list8, am_ac), (list8, am_tv);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list8, CURRENT_DATE, 5); -- 5 rooms available

  -- Listing 9: Hostel (Monthly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_hostel, 'Backpacker Haven - Bunk Bed', 'Monthly co-living arrangement in a vibrant hostel community.', 1, 'DE', 'Germany', 'Berlin', 'Berlin', 'Berlin, Germany', 'published')
  RETURNING id INTO list9;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list9, 500.00, 'EUR', 'month', 500.00, 1); -- Minimum 1 month
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list9, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list9, am_wifi);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list9, CURRENT_DATE, 10);

  -- Listing 10: Homestay (Monthly)
  INSERT INTO public.listings (host_id, type_id, title, description, max_occupants, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_homestay, 'Traditional Kyoto Machiya', 'Stay in a restored traditional wooden townhouse for an immersive cultural experience.', 3, 'JP', 'Japan', 'Kyoto', 'Kyoto', 'Kyoto, Japan', 'published')
  RETURNING id INTO list10;
  
  INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit, minimum_duration) 
  VALUES (list10, 200000.00, 'JPY', 'month', 100000.00, 3); -- Minimum 3 months
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list10, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list10, am_wifi), (list10, am_kitchen);
  INSERT INTO public.listing_availability (listing_id, available_from, available_units) VALUES (list10, CURRENT_DATE, 1);

  -- Ensure public_id is populated for seeded listings
  UPDATE public.listings SET public_id = public.generate_public_id() WHERE public_id IS NULL;

END $$;
