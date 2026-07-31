-- Seed Data for Phase 5: Public Listings
-- Using a DO block to avoid hardcoded IDs and maintain referential integrity

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
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  ('00000000-0000-0000-0000-000000000000', host1, 'authenticated', 'authenticated', 'host1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', host2, 'authenticated', 'authenticated', 'host2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Michael Chen"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', host3, 'authenticated', 'authenticated', 'host3@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Rodriguez"}', NOW(), NOW());

  -- Update profiles to host
  ALTER TABLE public.profiles DISABLE TRIGGER enforce_profile_immutability;
  UPDATE public.profiles SET role = 'host'::user_role WHERE id IN (host1, host2, host3);
  ALTER TABLE public.profiles ENABLE TRIGGER enforce_profile_immutability;


  -----------------------------------------------------------------------------
  -- 2. Create Listing Types
  -----------------------------------------------------------------------------
  INSERT INTO public.listing_types (name, description) VALUES ('Apartment', 'A flat or unit') RETURNING id INTO type_apt;
  INSERT INTO public.listing_types (name, description) VALUES ('Villa', 'A luxurious country residence') RETURNING id INTO type_villa;
  INSERT INTO public.listing_types (name, description) VALUES ('Cabin', 'A rustic home') RETURNING id INTO type_cabin;
  INSERT INTO public.listing_types (name, description) VALUES ('Beach House', 'A house on the beach') RETURNING id INTO type_beach;
  INSERT INTO public.listing_types (name, description) VALUES ('Farm Stay', 'A farm') RETURNING id INTO type_farm;
  INSERT INTO public.listing_types (name, description) VALUES ('Hotel Room', 'A hotel room') RETURNING id INTO type_hotel;
  INSERT INTO public.listing_types (name, description) VALUES ('Hostel', 'A hostel') RETURNING id INTO type_hostel;
  INSERT INTO public.listing_types (name, description) VALUES ('Homestay', 'A homestay') RETURNING id INTO type_homestay;


  -----------------------------------------------------------------------------
  -- 3. Create Amenities
  -----------------------------------------------------------------------------
  INSERT INTO public.amenities (name, icon) VALUES ('WiFi', 'wifi') RETURNING id INTO am_wifi;
  INSERT INTO public.amenities (name, icon) VALUES ('Pool', 'waves') RETURNING id INTO am_pool;
  INSERT INTO public.amenities (name, icon) VALUES ('Kitchen', 'utensils') RETURNING id INTO am_kitchen;
  INSERT INTO public.amenities (name, icon) VALUES ('Air Conditioning', 'snowflake') RETURNING id INTO am_ac;
  INSERT INTO public.amenities (name, icon) VALUES ('Free Parking', 'car') RETURNING id INTO am_parking;
  INSERT INTO public.amenities (name, icon) VALUES ('TV', 'tv') RETURNING id INTO am_tv;
  INSERT INTO public.amenities (name, icon) VALUES ('Washer', 'shirt') RETURNING id INTO am_washer;


  -----------------------------------------------------------------------------
  -- 4. Create Listings
  -----------------------------------------------------------------------------
  -- Listing 1: Apartment
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_apt, 'Cozy Downtown Studio', 'A perfect compact space for urban explorers.', 2, 'US', 'USA', 'NY', 'New York', 'New York, NY', 'published')
  RETURNING id INTO list1;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list1, 75.00, 25.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list1, am_wifi), (list1, am_kitchen), (list1, am_ac);

  -- Listing 2: Apartment
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_apt, 'Modern City View Flat', 'Enjoy stunning skyline views.', 4, 'US', 'USA', 'IL', 'Chicago', 'Chicago, IL', 'published')
  RETURNING id INTO list2;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list2, 150.00, 50.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list2, 'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list2, am_wifi), (list2, am_ac), (list2, am_tv);

  -- Listing 3: Villa
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_villa, 'Mediterranean Serenity Villa', 'A sprawling estate with a private pool.', 8, 'GR', 'Greece', 'South Aegean', 'Santorini', 'Santorini, Greece', 'published')
  RETURNING id INTO list3;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list3, 1200.00, 200.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list3, am_wifi), (list3, am_pool), (list3, am_parking), (list3, am_ac);

  -- Listing 4: Cabin
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host3, type_cabin, 'Rustic Pine Cabin', 'Escape to the mountains.', 4, 'US', 'USA', 'CO', 'Aspen', 'Aspen, CO', 'published')
  RETURNING id INTO list4;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list4, 110.00, 40.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list4, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list4, am_parking), (list4, am_kitchen);

  -- Listing 5: Beach House
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_beach, 'Oceanfront Paradise', 'Step directly from your patio onto pristine white sands.', 6, 'US', 'USA', 'CA', 'Malibu', 'Malibu, CA', 'published')
  RETURNING id INTO list5;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list5, 650.00, 120.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list5, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list5, am_wifi), (list5, am_kitchen), (list5, am_parking), (list5, am_washer);

  -- Listing 6: Beach House (Draft)
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host3, type_beach, 'Sunset Beach Cottage', 'A charming cottage undergoing renovations.', 4, 'US', 'USA', 'FL', 'Miami', 'Miami, FL', 'draft')
  RETURNING id INTO list6;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list6, 300.00, 80.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list6, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=2000', 1);

  -- Listing 7: Farm Stay
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_farm, 'Historic Vineyard Estate', 'Stay on a working vineyard.', 12, 'IT', 'Italy', 'Tuscany', 'Florence', 'Tuscany, Italy', 'published')
  RETURNING id INTO list7;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee, currency) VALUES (list7, 500.00, 100.00, 'EUR');
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list7, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list7, am_parking), (list7, am_kitchen), (list7, am_washer);

  -- Listing 8: Hotel Room
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_hotel, 'Boutique Hotel King Suite', 'Spacious suite in the historic district.', 2, 'FR', 'France', 'Ile-de-France', 'Paris', 'Paris, France', 'published')
  RETURNING id INTO list8;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee, currency) VALUES (list8, 280.00, 0.00, 'EUR');
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list8, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list8, am_wifi), (list8, am_ac), (list8, am_tv);

  -- Listing 9: Hostel
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host1, type_hostel, 'Backpacker Haven - Bunk Bed', 'Shared room in a lively hostel.', 1, 'DE', 'Germany', 'Berlin', 'Berlin', 'Berlin, Germany', 'published')
  RETURNING id INTO list9;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee, currency) VALUES (list9, 25.00, 5.00, 'EUR');
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list9, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list9, am_wifi);

  -- Listing 10: Homestay
  INSERT INTO public.listings (host_id, type_id, title, description, max_guests, country_code, country, state, city, formatted_address, status)
  VALUES (host2, type_homestay, 'Traditional Kyoto Machiya', 'Stay in a restored traditional wooden townhouse.', 3, 'JP', 'Japan', 'Kyoto', 'Kyoto', 'Kyoto, Japan', 'published')
  RETURNING id INTO list10;
  
  INSERT INTO public.listing_prices (listing_id, base_price_per_night, cleaning_fee) VALUES (list10, 130.00, 30.00);
  INSERT INTO public.listing_images (listing_id, storage_path, display_order) VALUES (list10, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=2000', 1);
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (list10, am_wifi), (list10, am_kitchen);

  -- Ensure public_id is populated for seeded listings
  UPDATE public.listings SET public_id = public.generate_public_id() WHERE public_id IS NULL;

END $$;
