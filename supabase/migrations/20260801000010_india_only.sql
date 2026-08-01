/*
==================================================
Domain: Location & Pricing
Purpose: Enforce India-only scope by constraining currency and removing denormalized country fields.
==================================================
*/

-- 1. Enforce INR for all prices
ALTER TABLE public.listing_prices 
DROP CONSTRAINT IF EXISTS check_currency_inr;

ALTER TABLE public.listing_prices 
ADD CONSTRAINT check_currency_inr CHECK (currency = 'INR');

-- 2. Remove denormalized country fields from listings
ALTER TABLE public.listings 
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS country_code;
