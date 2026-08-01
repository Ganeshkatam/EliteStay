/*
==================================================
Domain: Geography
Purpose: Establish master reference data hierarchy for locations.
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
    population BIGINT,
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
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone TEXT,
    cover_image_storage_path TEXT,
    description TEXT,
    population BIGINT,
    is_capital BOOLEAN DEFAULT false NOT NULL,
    is_metro BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(state_id, slug)
);

-- 4. Update Listings Table
ALTER TABLE public.listings 
ADD COLUMN city_id BIGINT REFERENCES public.cities(id) ON DELETE SET NULL;

-- 5. Triggers for updated_at
CREATE TRIGGER countries_updated_at 
  BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER states_updated_at 
  BEFORE UPDATE ON public.states FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER cities_updated_at 
  BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Indexes
CREATE INDEX cities_state_idx ON public.cities(state_id);
CREATE INDEX cities_active_idx ON public.cities(is_active);
CREATE INDEX cities_featured_idx ON public.cities(is_featured);
CREATE INDEX listings_city_idx ON public.listings(city_id);

-- 7. RLS Policies
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public can view active states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public can view active cities" ON public.cities FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage geography" ON public.countries FOR ALL USING (public.is_admin());
CREATE POLICY "Only admins can manage geography" ON public.states FOR ALL USING (public.is_admin());
CREATE POLICY "Only admins can manage geography" ON public.cities FOR ALL USING (public.is_admin());

-- 8. City Images Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('city-images', 'city-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'city-images');
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'city-images' AND public.is_admin());
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'city-images' AND public.is_admin());
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'city-images' AND public.is_admin());
