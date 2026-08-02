/*
==================================================
Domain: Geography & Locations
Purpose: Master reference data hierarchy for locations and geocoding cache.
Contains: 
- countries
- states
- cities
- geocoding_cache
- geography triggers & RLS policies
==================================================
*/

-- 1. Create Countries Table
CREATE TABLE public.countries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_code TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    iso2 TEXT UNIQUE NOT NULL,
    iso3 TEXT UNIQUE NOT NULL,
    currency_code TEXT,
    phone_code TEXT,
    timezone_default TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create States Table
CREATE TABLE public.states (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
    external_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(country_id, slug)
);

-- 3. Create Cities Table
CREATE TABLE public.cities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    state_id BIGINT REFERENCES public.states(id) ON DELETE CASCADE NOT NULL,
    external_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    search_aliases TEXT[] DEFAULT '{}',
    slug TEXT NOT NULL,
    latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
    timezone TEXT,
    cover_image_storage_path TEXT,
    description TEXT,
    is_capital BOOLEAN DEFAULT false NOT NULL,
    is_metro BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(state_id, slug)
);

-- 4. Create Geocoding Cache Table
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

-- 5. Triggers for updated_at
CREATE TRIGGER countries_updated_at 
  BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER states_updated_at 
  BEFORE UPDATE ON public.states FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER cities_updated_at 
  BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Indexes
CREATE INDEX IF NOT EXISTS cities_state_idx ON public.cities(state_id);
CREATE INDEX IF NOT EXISTS cities_active_idx ON public.cities(is_active);
CREATE INDEX IF NOT EXISTS cities_featured_idx ON public.cities(is_featured);

-- 7. RLS Policies
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geocoding_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public can view active states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public can view active cities" ON public.cities FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage countries" ON public.countries FOR ALL USING (public.is_admin());
CREATE POLICY "Only admins can manage states" ON public.states FOR ALL USING (public.is_admin());
CREATE POLICY "Only admins can manage cities" ON public.cities FOR ALL USING (public.is_admin());

-- Geocoding Cache Policies
CREATE POLICY "Enable read access for authenticated users" ON public.geocoding_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.geocoding_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.geocoding_cache FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 8. Create Localities Table
CREATE TABLE public.localities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city_id BIGINT REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT localities_city_slug_key UNIQUE (city_id, slug),
    CONSTRAINT localities_city_name_key UNIQUE (city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_localities_city_id ON public.localities(city_id);
CREATE INDEX IF NOT EXISTS idx_localities_slug ON public.localities(slug);
CREATE INDEX IF NOT EXISTS idx_localities_name_lower ON public.localities(LOWER(name));

CREATE TRIGGER localities_updated_at 
  BEFORE UPDATE ON public.localities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on localities" ON public.localities FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Allow admin management on localities" ON public.localities FOR ALL USING (public.is_admin());
