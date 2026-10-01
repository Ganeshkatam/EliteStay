/*
==================================================
Domain: Storage Buckets
Purpose: Configures Supabase object storage buckets and storage access RLS policies.
Contains: 
- Storage bucket definitions (listings, avatars)
- Storage policies for object management
==================================================
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES 
  ('listings', 'listings', true, 2097152),
  ('avatars', 'avatars', true, 3145728)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public Access Listings" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Listings" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Hosts update own listing photos" ON storage.objects;

-- Allow public to read objects
CREATE POLICY "Public Access Listings" ON storage.objects FOR SELECT 
USING (bucket_id = 'listings');

CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated hosts to upload and manage listing photos
CREATE POLICY "Hosts can upload listing photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Hosts can update listing photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Hosts can delete listing photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listings'
    AND (
      public.is_admin()
      OR public.is_listing_owner(((storage.foldername(name))[1])::uuid)
    )
  );
