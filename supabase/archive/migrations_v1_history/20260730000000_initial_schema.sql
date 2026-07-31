-- EliteStay Domain-Driven Initial Schema
-- Migration 00000000000000_initial_schema.sql

-- 1. Enums
CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'published', 'paused', 'archived');
CREATE TYPE booking_status AS ENUM ('pending', 'awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'expired', 'refunded');

-- 2. Core Entities
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'guest'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listing_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    max_guests INTEGER DEFAULT 1 NOT NULL,
    
    -- Normalized Location
    country_code TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    locality TEXT,
    postal_code TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    formatted_address TEXT,
    
    status listing_status DEFAULT 'draft'::listing_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listing_amenities (
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE public.listing_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    base_price_per_night NUMERIC(12, 2) NOT NULL,
    cleaning_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listing_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    price_override NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(listing_id, date)
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    status booking_status DEFAULT 'pending'::booking_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(booking_id) -- One review per booking
);


-- 3. Security (RLS) - "Default Deny" on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Triggers (Updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_types_updated_at BEFORE UPDATE ON public.listing_types FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_images_updated_at BEFORE UPDATE ON public.listing_images FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER amenities_updated_at BEFORE UPDATE ON public.amenities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_amenities_updated_at BEFORE UPDATE ON public.listing_amenities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_prices_updated_at BEFORE UPDATE ON public.listing_prices FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_availability_updated_at BEFORE UPDATE ON public.listing_availability FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
