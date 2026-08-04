-- Migration: Finalize Unique Icons
-- Purpose: Ensure every accommodation type and property style has a unique, content-related icon.

-- Update Accommodation Types
UPDATE public.accommodation_types SET icon = 'bed-double' WHERE slug = 'hostel';
UPDATE public.accommodation_types SET icon = 'building-2' WHERE slug = 'apartment';
-- Penthouse is already 'building', Villa is already 'palmtree', PG is 'users', Co-living is 'users-round', Serviced Apartment is 'hotel', House is 'home'.

-- Update Property Types
UPDATE public.property_types SET icon = 'building-2' WHERE slug = 'apartment';
UPDATE public.property_types SET icon = 'palmtree' WHERE slug = 'villa';
-- Penthouse is 'building', House is 'home', PG is 'users', Hostel is 'bed-double', Dormitory is 'bed'.
