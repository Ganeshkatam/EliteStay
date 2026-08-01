/*
==================================================
Domain: Database Hardening
Purpose: Patch remaining InitPlan warnings
==================================================
*/

-- Profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = (select auth.uid()));

-- Listings
DROP POLICY IF EXISTS "Public can read published listings" ON public.listings;
CREATE POLICY "Public can read published listings" ON public.listings FOR SELECT USING (status = 'published'::public.listing_status OR host_id = (select auth.uid()) OR public.is_admin());
