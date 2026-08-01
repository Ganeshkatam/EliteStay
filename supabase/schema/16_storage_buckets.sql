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

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload Listings" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/delete their uploaded objects
CREATE POLICY "Users modify own avatars" ON storage.objects FOR ALL
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users modify own listing photos" ON storage.objects FOR ALL
USING (bucket_id = 'listings' AND auth.uid() = owner);
