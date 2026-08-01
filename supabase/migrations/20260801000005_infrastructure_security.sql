-- Phase A: Infrastructure Security Hardening

-- 1. Storage Policies
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Listings" ON storage.objects;

-- Avatar Policies
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name = auth.uid()::text || '/avatar.webp'
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name = auth.uid()::text || '/avatar.webp'
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publically viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Listing Images Policies
CREATE POLICY "Hosts can upload listing images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Hosts can update listing images"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Hosts can delete listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Listings are publically viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');


-- 2. Duplicate RLS Cleanup
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;


-- 3. Constraints
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_stay_id_key,
  DROP CONSTRAINT IF EXISTS reviews_comment_length_check,
  ADD CONSTRAINT reviews_comment_length_check CHECK (length(comment) <= 5000),
  ADD CONSTRAINT reviews_stay_guest_unique UNIQUE (stay_id, guest_id);


-- 4. Function Security (`search_path = ''` and schema qualifying)

-- Fix handle_new_user to use avatar_storage_path AND set secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_storage_path, 
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    'guest'::public.user_role,
    NOW(),
    NOW()
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Alter existing SECURITY DEFINER functions to empty search_path
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.is_host() SET search_path = '';
ALTER FUNCTION public.is_listing_owner(uuid) SET search_path = '';
ALTER FUNCTION public.protect_identity_fields() SET search_path = '';

-- Note: search_listings is large but its body already explicitly uses "public.table_name"
ALTER FUNCTION public.search_listings(text, text, uuid, public.furnishing, public.gender_preference, public.occupancy_type, public.billing_period, text[], numeric, numeric, date, text, integer, integer) SET search_path = '';

ALTER FUNCTION public.get_listing_detail(text) SET search_path = '';


-- 5. Missing FK Indexes
CREATE INDEX IF NOT EXISTS bookings_listing_id_idx ON public.bookings(listing_id);
CREATE INDEX IF NOT EXISTS bookings_guest_id_idx ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS stays_created_from_booking_id_idx ON public.stays(created_from_booking_id);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS listing_images_listing_id_idx ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS listing_prices_listing_id_idx ON public.listing_prices(listing_id);
