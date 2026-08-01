/*
==================================================
Domain: Listings
Purpose: Core marketplace domain for property listings and host workflows.
Contains: 
- listings
- listing_amenities
- listing_build_progress
- is_listing_owner helper function
- triggers, RLS, & performance indexes
==================================================
*/

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT UNIQUE NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE RESTRICT NOT NULL,
    property_type TEXT DEFAULT 'Apartment' NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    max_occupants INTEGER DEFAULT 1 NOT NULL,
    occupancy_type public.occupancy_type DEFAULT 'private'::public.occupancy_type NOT NULL,
    gender_preference public.gender_preference DEFAULT 'any'::public.gender_preference NOT NULL,
    furnishing public.furnishing DEFAULT 'unfurnished'::public.furnishing NOT NULL,
    
    -- Location Fields
    state TEXT,
    city TEXT,
    city_id BIGINT REFERENCES public.cities(id) ON DELETE SET NULL,
    locality TEXT,
    postal_code TEXT,
    latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
    formatted_address TEXT,
    
    status public.listing_status DEFAULT 'draft'::public.listing_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT published_listing_requires_coordinates CHECK (
        status <> 'published'
        OR (latitude IS NOT NULL AND longitude IS NOT NULL AND formatted_address IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_listings_public_id ON public.listings(public_id);
CREATE INDEX IF NOT EXISTS idx_listings_host_id ON public.listings(host_id);
CREATE INDEX IF NOT EXISTS idx_listings_lat_lng ON public.listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS listings_city_idx ON public.listings(city_id);

CREATE OR REPLACE FUNCTION public.is_listing_owner(p_listing_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.listings 
    WHERE id = p_listing_id AND host_id = auth.uid()
  );
END;
$$;

CREATE TABLE public.listing_amenities (
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (listing_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS listing_amenities_amenity_idx ON public.listing_amenities(amenity_id);

CREATE TABLE public.listing_build_progress (
    listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    step_completed TEXT,
    last_step TEXT NOT NULL DEFAULT 'accommodation',
    percent_complete INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Triggers
CREATE TRIGGER listings_updated_at 
  BEFORE UPDATE ON public.listings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER listings_set_public_id
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_public_id();

CREATE TRIGGER listings_prevent_public_id_update
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_prevent_public_id_update();

CREATE TRIGGER listing_amenities_updated_at 
  BEFORE UPDATE ON public.listing_amenities 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER listing_build_progress_updated_at 
  BEFORE UPDATE ON public.listing_build_progress 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_build_progress ENABLE ROW LEVEL SECURITY;

-- Listings Policies
CREATE POLICY "Public can read published listings" ON public.listings
  FOR SELECT USING (status = 'published'::public.listing_status OR host_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (public.is_host() OR public.is_admin()) AND
    host_id = auth.uid()
  );

CREATE POLICY "Hosts can update own listings" ON public.listings
  FOR UPDATE USING (host_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can delete own listings" ON public.listings
  FOR DELETE USING (host_id = auth.uid() OR public.is_admin());

-- Listing Amenities Policies
CREATE POLICY "Public can view listing amenities" ON public.listing_amenities
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own listing amenities" ON public.listing_amenities
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_amenities.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );

-- Listing Build Progress Policies
CREATE POLICY "Hosts can view own listing progress" ON public.listing_build_progress
  FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_build_progress.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Hosts can insert own listing progress" ON public.listing_build_progress
  FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_build_progress.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Hosts can update own listing progress" ON public.listing_build_progress
  FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_build_progress.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Hosts can delete own listing progress" ON public.listing_build_progress
  FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_build_progress.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );
