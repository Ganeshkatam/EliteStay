-- 20260731030000_india_first_schema.sql

-- 1. Rename listing_types to accommodation_types
ALTER TABLE public.listing_types RENAME TO accommodation_types;
-- Rename constraint and index if they exist (Supabase auto names them based on table name often)
ALTER INDEX IF EXISTS listing_types_pkey RENAME TO accommodation_types_pkey;
ALTER TABLE public.accommodation_types RENAME CONSTRAINT listing_types_name_key TO accommodation_types_name_key;

-- 2. Rename type_id to accommodation_type_id in listings
ALTER TABLE public.listings RENAME COLUMN type_id TO accommodation_type_id;

-- 3. Create Enums
CREATE TYPE furnishing AS ENUM ('unfurnished', 'semi_furnished', 'fully_furnished');
CREATE TYPE gender_preference AS ENUM ('any', 'male', 'female');
CREATE TYPE occupancy_type AS ENUM ('private', 'shared', 'mixed');

-- 4. Add Columns to listings
ALTER TABLE public.listings 
  ADD COLUMN furnishing furnishing DEFAULT 'unfurnished'::furnishing NOT NULL,
  ADD COLUMN gender_preference gender_preference DEFAULT 'any'::gender_preference NOT NULL,
  ADD COLUMN occupancy_type occupancy_type DEFAULT 'private'::occupancy_type NOT NULL;
