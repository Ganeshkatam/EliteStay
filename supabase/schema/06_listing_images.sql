/*
==================================================
Domain: Listing Images
Purpose: Dedicated domain for property images.
Contains: 
- listing_images
- triggers
- RLS
==================================================
*/

CREATE TABLE public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_cover BOOLEAN DEFAULT false,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure only one cover image per listing
CREATE UNIQUE INDEX idx_listing_images_cover 
  ON public.listing_images (listing_id) 
  WHERE is_cover = true;

CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);

CREATE TRIGGER listing_images_updated_at 
  BEFORE UPDATE ON public.listing_images 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view listing images" ON public.listing_images
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own listing images" ON public.listing_images
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_images.listing_id 
        AND l.host_id = auth.uid()
    )
  );
