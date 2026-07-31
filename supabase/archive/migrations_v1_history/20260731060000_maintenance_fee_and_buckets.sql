-- 20260731060000_maintenance_fee_and_buckets.sql

-- 1. Add maintenance_fee_period to listing_prices
-- First we add the column using the existing billing_period enum.
-- We also add a default value to not break existing rows, then we can drop the default if we want, but it's fine to keep it.
ALTER TABLE public.listing_prices 
ADD COLUMN IF NOT EXISTS maintenance_fee_period billing_period DEFAULT 'semester'::billing_period;

-- 2. Create Storage Buckets with strict size limits
-- listings: max 2MB
-- avatars: max 3MB
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES 
  ('listings', 'listings', true, 2097152),
  ('avatars', 'avatars', true, 3145728)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit;

-- 3. Set up basic RLS for public read access to these buckets
-- Allow public to read objects in listings bucket
CREATE POLICY "Public Access Listings" ON storage.objects FOR SELECT 
USING (bucket_id = 'listings');

-- Allow public to read objects in avatars bucket
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to listings bucket
CREATE POLICY "Auth Upload Listings" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
