/*
==================================================
Migration: Phase 3.1 Accommodation Domain Simplification (10/10 Architecture)
Purpose:
  1. Purge real-estate sales and construction-oriented metadata from listing_features.
  2. Drop facing_directions reference table as it is irrelevant to residential living journeys.
  3. Enforce consistent boolean naming conventions (has_/is_) on listing_features for resident-facing attributes:
     - has_attached_bathroom (retained)
     - has_attached_balcony
     - has_air_conditioning
     - is_wheelchair_accessible
==================================================
*/

-- 1. Drop facing_directions reference table and dependent foreign key constraints
DROP TABLE IF EXISTS public.facing_directions CASCADE;

-- 2. Clean up listing_features table to focus strictly on resident experience
ALTER TABLE public.listing_features
    DROP CONSTRAINT IF EXISTS check_balcony_count,
    DROP CONSTRAINT IF EXISTS check_area,
    DROP CONSTRAINT IF EXISTS check_area_unit,
    DROP COLUMN IF EXISTS floor_number,
    DROP COLUMN IF EXISTS total_floors,
    DROP COLUMN IF EXISTS area,
    DROP COLUMN IF EXISTS area_unit,
    DROP COLUMN IF EXISTS facing_direction_id,
    DROP COLUMN IF EXISTS balcony_count,
    ADD COLUMN IF NOT EXISTS has_lift BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS has_attached_balcony BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS has_air_conditioning BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS is_wheelchair_accessible BOOLEAN DEFAULT false NOT NULL;

-- Ensure has_attached_bathroom remains defaulted cleanly
ALTER TABLE public.listing_features
    ALTER COLUMN has_attached_bathroom SET DEFAULT false,
    ALTER COLUMN has_attached_bathroom SET NOT NULL;
