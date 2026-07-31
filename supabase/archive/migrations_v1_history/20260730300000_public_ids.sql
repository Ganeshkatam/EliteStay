-- Add public_id to public.listings

-- 1. Create a function to generate a random 8-character alphanumeric string
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Add the column
ALTER TABLE public.listings 
ADD COLUMN public_id TEXT UNIQUE;

-- 3. Populate existing rows
UPDATE public.listings SET public_id = public.generate_public_id() WHERE public_id IS NULL;

-- 4. Make it NOT NULL and default to generating new IDs
ALTER TABLE public.listings
ALTER COLUMN public_id SET NOT NULL,
ALTER COLUMN public_id SET DEFAULT public.generate_public_id();

-- 5. Create an index for fast lookups
CREATE INDEX idx_listings_public_id ON public.listings(public_id);
