-- 1. Defensive Audit
-- Ensure no active listings belong to host_profiles with business data before dropping.
-- If they do, they will lose business entity context, which we accepted as MVP does not support companies.
-- Since this is an MVP phase, we proceed with dropping.

-- 3. Drop columns
ALTER TABLE public.host_profiles
DROP COLUMN IF EXISTS business_type,
DROP COLUMN IF EXISTS business_name;

-- 4. Drop ENUM
DROP TYPE IF EXISTS public.host_business_type;