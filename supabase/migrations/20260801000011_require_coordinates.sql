-- 1. Create a cache to minimize API calls
CREATE TABLE public.geocoding_cache (
    cache_key TEXT PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    formatted_address TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_place_id TEXT,
    confidence NUMERIC,
    geocoded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 years'
);

ALTER TABLE public.geocoding_cache ENABLE ROW LEVEL SECURITY;

-- 2. Enforce coordinates on published listings
ALTER TABLE public.listings
ADD CONSTRAINT published_listing_requires_coordinates
CHECK (
    status <> 'published'
    OR (
        latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND formatted_address IS NOT NULL
    )
);
