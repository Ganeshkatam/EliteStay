-- Migration: Semantic Icon Consistency & Taxonomy Cleanup
-- Purpose: Enforce Semantic Icon Rule and freeze taxonomy to 6 canonical types.

-- 1. Delete redundant accommodation types (Moved to Property Types)
DELETE FROM public.accommodation_types WHERE slug IN ('serviced-apartment', 'villa', 'penthouse');

-- 2. Update Accommodation Types
UPDATE public.accommodation_types SET icon = 'users' WHERE slug = 'pg';
UPDATE public.accommodation_types SET icon = 'bed-double' WHERE slug = 'hostel';
UPDATE public.accommodation_types SET icon = 'building-2' WHERE slug = 'apartment';
UPDATE public.accommodation_types SET icon = 'home' WHERE slug = 'house';
UPDATE public.accommodation_types SET icon = 'users-round' WHERE slug = 'coliving';
UPDATE public.accommodation_types SET icon = 'building' WHERE slug = 'other';

-- 3. Delete redundant amenities
DELETE FROM public.amenities WHERE id IN (
  '911cfcae-3f3a-4638-a375-db160ececf88', -- Air Conditioning
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b24', -- Car Parking
  'c2d5152e-fd3d-4ff7-b7f0-1cdf7af7f22e'  -- WiFi duplicate
);

-- 4. Update Amenity Icons
UPDATE public.amenities SET icon = 'snowflake' WHERE slug = 'ac';
UPDATE public.amenities SET icon = 'sun' WHERE slug = 'balcony';
UPDATE public.amenities SET icon = 'flame' WHERE slug = 'bbq-area';
UPDATE public.amenities SET icon = 'bed' WHERE slug = 'bed';
UPDATE public.amenities SET icon = 'bike' WHERE slug = 'bike-parking';
UPDATE public.amenities SET icon = 'fingerprint' WHERE slug = 'biometric-entry';
UPDATE public.amenities SET icon = 'video' WHERE slug = 'cctv';
UPDATE public.amenities SET icon = 'users' WHERE slug = 'common-room';
UPDATE public.amenities SET icon = 'zap' WHERE slug = 'electricity';
UPDATE public.amenities SET icon = 'bell' WHERE slug = 'fire-alarm';
UPDATE public.amenities SET icon = 'trees' WHERE slug = 'garden';
UPDATE public.amenities SET icon = 'chef-hat' WHERE slug = 'gas-stove';
UPDATE public.amenities SET icon = 'thermometer' WHERE slug = 'geyser';
UPDATE public.amenities SET icon = 'dumbbell' WHERE slug = 'gym';
UPDATE public.amenities SET icon = 'sparkles' WHERE slug = 'housekeeping';
UPDATE public.amenities SET icon = 'cooking-pot' WHERE slug = 'kitchen';
UPDATE public.amenities SET icon = 'shirt' WHERE slug = 'laundry';
UPDATE public.amenities SET icon = 'arrow-up-down' WHERE slug = 'lift';
UPDATE public.amenities SET icon = 'lock' WHERE slug = 'lockers';
UPDATE public.amenities SET icon = 'utensils' WHERE slug = 'meals';
UPDATE public.amenities SET icon = 'soup' WHERE slug = 'mess';
UPDATE public.amenities SET icon = 'microwave' WHERE slug = 'microwave';
UPDATE public.amenities SET icon = 'car' WHERE slug = 'parking';
UPDATE public.amenities SET icon = 'heart' WHERE slug = 'pet-friendly';
UPDATE public.amenities SET icon = 'waves' WHERE slug = 'pool';
UPDATE public.amenities SET icon = 'battery-charging' WHERE slug = 'power-backup';
UPDATE public.amenities SET icon = 'car' WHERE slug = 'private-parking';
UPDATE public.amenities SET icon = 'user-check' WHERE slug = 'reception';
UPDATE public.amenities SET icon = 'refrigerator' WHERE slug = 'refrigerator';
UPDATE public.amenities SET icon = 'glass-water' WHERE slug = 'ro-water';
UPDATE public.amenities SET icon = 'shield-check' WHERE slug = 'security';
UPDATE public.amenities SET icon = 'shield' WHERE slug = 'security-guard';
UPDATE public.amenities SET icon = 'book-open' WHERE slug = 'study-area';
UPDATE public.amenities SET icon = 'table' WHERE slug = 'study-table';
UPDATE public.amenities SET icon = 'sun' WHERE slug = 'terrace';
UPDATE public.amenities SET icon = 'archive' WHERE slug = 'wardrobe';
UPDATE public.amenities SET icon = 'droplets' WHERE slug = 'water';
UPDATE public.amenities SET icon = 'accessibility' WHERE slug = 'wheelchair-access';
UPDATE public.amenities SET icon = 'wifi', slug = 'wifi', name = 'WiFi' WHERE slug = 'wi-fi';

-- 5. Update Amenity Categories
UPDATE public.amenity_categories SET icon = 'wifi' WHERE slug = 'internet-connectivity';
UPDATE public.amenity_categories SET icon = 'zap' WHERE slug = 'utilities';
UPDATE public.amenity_categories SET icon = 'utensils' WHERE slug = 'kitchen-dining';
UPDATE public.amenity_categories SET icon = 'bed' WHERE slug = 'bedroom-comfort';
UPDATE public.amenity_categories SET icon = 'bath' WHERE slug = 'bathroom-hygiene';
UPDATE public.amenity_categories SET icon = 'shield' WHERE slug = 'safety-security';
UPDATE public.amenity_categories SET icon = 'car' WHERE slug = 'parking-transit';
UPDATE public.amenity_categories SET icon = 'washing-machine' WHERE slug = 'laundry-housekeeping';
UPDATE public.amenity_categories SET icon = 'dumbbell' WHERE slug = 'recreation-wellness';
UPDATE public.amenity_categories SET icon = 'trees' WHERE slug = 'outdoor-common-spaces';
UPDATE public.amenity_categories SET icon = 'concierge-bell' WHERE slug = 'services-managed-care';

-- 6. Update Property Types
UPDATE public.property_types SET icon = 'building-2' WHERE slug = 'apartment';
UPDATE public.property_types SET icon = 'house' WHERE slug = 'villa';
UPDATE public.property_types SET icon = 'home' WHERE slug = 'house';
UPDATE public.property_types SET icon = 'users' WHERE slug = 'pg';
UPDATE public.property_types SET icon = 'bed-double' WHERE slug = 'hostel';
UPDATE public.property_types SET icon = 'building' WHERE slug = 'serviced-apartment';
UPDATE public.property_types SET icon = 'bed' WHERE slug = 'dormitory';
UPDATE public.property_types SET icon = 'building' WHERE slug = 'penthouse';
