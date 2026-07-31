-- 20260731070000_listing_images_metadata.sql

-- Add metadata columns to listing_images table
ALTER TABLE public.listing_images
ADD COLUMN IF NOT EXISTS width integer,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS is_cover boolean DEFAULT false;

-- Create an index to quickly find the cover image for a listing
CREATE INDEX IF NOT EXISTS idx_listing_images_cover 
ON public.listing_images(listing_id) 
WHERE is_cover = true;
