/*
==================================================
Domain: Database Hardening
Purpose: Schema Cleanup and Data Integrity Constraints
==================================================
*/

-- 1. Profiles Cleanup
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city;

-- 2. Listings Coordinates
ALTER TABLE public.listings 
ALTER COLUMN latitude TYPE DOUBLE PRECISION,
ALTER COLUMN longitude TYPE DOUBLE PRECISION;

-- 3. Default Currency
ALTER TABLE public.listing_prices 
ALTER COLUMN currency SET DEFAULT 'INR';

-- 4. Conversation Uniqueness (Partial Indexes)
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_stay 
ON public.conversations(stay_id) 
WHERE stay_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_booking 
ON public.conversations(booking_id) 
WHERE booking_id IS NOT NULL;

-- 5. Listing Cover Image (Partial Unique Index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_images_single_cover 
ON public.listing_images(listing_id) 
WHERE is_cover = true;

-- 6. Price Constraints
ALTER TABLE public.listing_prices 
ADD CONSTRAINT check_price_amount CHECK (amount > 0),
ADD CONSTRAINT check_currency_not_empty CHECK (currency <> '');

-- 7. Availability Constraints
ALTER TABLE public.listing_availability 
ADD CONSTRAINT check_availability_dates CHECK (end_date >= start_date);

-- 8. Stay Dates
ALTER TABLE public.stays 
ADD CONSTRAINT check_stay_dates CHECK (expected_move_out_date > expected_move_in_date);

-- 9. Booking Duration
ALTER TABLE public.bookings 
ADD CONSTRAINT check_booking_duration CHECK (requested_duration > 0);

-- 10. Coordinates Constraints
ALTER TABLE public.cities 
ADD CONSTRAINT check_cities_latitude CHECK (latitude BETWEEN -90 AND 90),
ADD CONSTRAINT check_cities_longitude CHECK (longitude BETWEEN -180 AND 180);

ALTER TABLE public.listings 
ADD CONSTRAINT check_listings_latitude CHECK (latitude BETWEEN -90 AND 90),
ADD CONSTRAINT check_listings_longitude CHECK (longitude BETWEEN -180 AND 180);
