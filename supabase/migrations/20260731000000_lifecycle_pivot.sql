-- 20260731000000_lifecycle_pivot.sql

-- 1. Drop dependent tables to recreate them with the new schema
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.listing_availability CASCADE;
DROP TABLE IF EXISTS public.listing_prices CASCADE;

-- Rename max_guests to max_occupants
ALTER TABLE public.listings RENAME COLUMN max_guests TO max_occupants;

-- 2. Create Enums
DROP TYPE IF EXISTS booking_status CASCADE; -- Dropping old one to recreate
CREATE TYPE billing_period AS ENUM ('day', 'week', 'month', 'semester', 'year');
CREATE TYPE availability_status AS ENUM ('available', 'occupied', 'unavailable');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'expired');
CREATE TYPE stay_status AS ENUM ('upcoming', 'active', 'extended', 'completed', 'terminated');

-- 3. Recreate Tables

CREATE TABLE public.listing_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    billing_period billing_period NOT NULL,
    security_deposit NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    maintenance_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    minimum_duration INTEGER DEFAULT 1 NOT NULL,
    maximum_duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.listing_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    available_from DATE NOT NULL,
    available_units INTEGER DEFAULT 1 NOT NULL,
    status availability_status DEFAULT 'available'::availability_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    requested_move_in DATE NOT NULL,
    requested_duration INTEGER NOT NULL,
    message TEXT,
    expires_at TIMESTAMPTZ,
    status booking_status DEFAULT 'pending'::booking_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    created_from_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expected_move_in_date DATE NOT NULL,
    actual_move_in_date DATE,
    expected_move_out_date DATE NOT NULL,
    actual_move_out_date DATE,
    agreed_amount NUMERIC(12, 2) NOT NULL,
    agreed_billing_period billing_period NOT NULL,
    security_deposit_paid NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    status stay_status DEFAULT 'upcoming'::stay_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    stay_id UUID REFERENCES public.stays(id) ON DELETE RESTRICT NOT NULL UNIQUE,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.listing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Add Triggers
CREATE TRIGGER listing_prices_updated_at BEFORE UPDATE ON public.listing_prices FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER listing_availability_updated_at BEFORE UPDATE ON public.listing_availability FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER stays_updated_at BEFORE UPDATE ON public.stays FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
