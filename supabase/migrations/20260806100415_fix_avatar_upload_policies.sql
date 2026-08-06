BEGIN;

-- During security hardening, broad public SELECT policies were dropped to prevent bucket enumeration.
-- However, Supabase Storage requires an authenticated SELECT policy for upsert operations (like avatar uploads)
-- so the Storage API can check if the object exists before deciding between INSERT and UPDATE.
-- In addition, PostgreSQL UPDATE policies must also contain a USING clause to evaluate existing rows.

DROP POLICY IF EXISTS "Users can select their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- Re-create the UPDATE policy with BOTH `USING` and `WITH CHECK` clauses.
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name = auth.uid()::text || '/avatar.webp'
);

-- Create a SELECT policy for authenticated users so `upsert` can verify file existence.
CREATE POLICY "Users can select their own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;
