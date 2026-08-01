-- Remove unused fields from Profile Identity Hub redesign
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS emergency_contact_name,
DROP COLUMN IF EXISTS emergency_contact_phone,
DROP COLUMN IF EXISTS timezone,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS government_id_verified,
DROP COLUMN IF EXISTS address_verified;
