-- Fix for RLS errors during public access (anon role)
-- The security hardening migration revoked EXECUTE on these functions from PUBLIC.
-- Because these functions are used inside RLS policies for tables that anon users 
-- need to query (like cities, listings, accommodations), anon MUST have EXECUTE 
-- privileges on them, otherwise the entire query fails with 'permission denied for function'.

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_host() TO anon;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(UUID) TO anon;
