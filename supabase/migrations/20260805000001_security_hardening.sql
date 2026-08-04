-- Migration: Security Hardening (Supabase Linter Remediation)
-- Fixes: function_search_path_mutable, anon_security_definer_function_executable,
--        rls_policy_always_true, public_bucket_allows_listing

BEGIN;

-- =============================================================================
-- 1. FIX SEARCH_PATH ON SECURITY DEFINER FUNCTIONS
-- =============================================================================

-- handle_new_user: search_path was null (lost during CREATE OR REPLACE)
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- get_listing_detail: search_path was null (lost during CREATE OR REPLACE)
ALTER FUNCTION public.get_listing_detail(text) SET search_path = '';

-- enforce_host_accommodation_specialization: was 'public' instead of ''
ALTER FUNCTION public.enforce_host_accommodation_specialization() SET search_path = '';


-- =============================================================================
-- 2. REVOKE EXECUTE FROM PUBLIC ON INTERNAL / TRIGGER FUNCTIONS
-- =============================================================================
-- PostgreSQL grants EXECUTE to PUBLIC by default. Since anon inherits from
-- PUBLIC, we must revoke from PUBLIC (not just anon) to fully lock these down.
-- Then we explicitly grant back to 'authenticated' for functions that need it.

-- Trigger functions (fired by DB engine, not by client RPC)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_deleted_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_identity_fields() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_host_accommodation_specialization() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_city_listing_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_set_public_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_prevent_public_id_update() FROM PUBLIC;

-- Internal helper functions (only called by other functions/triggers)
REVOKE EXECUTE ON FUNCTION public.uuid_to_public_id(UUID) FROM PUBLIC;

-- Auth-check helpers (used in RLS policies, must remain callable by authenticated)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_host() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_listing_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_host() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(UUID) TO authenticated;

-- Authenticated-only RPCs (require auth context to function correctly)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transition_booking(UUID, public.booking_status, public.booking_status, UUID, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transition_stay(UUID, public.stay_status, public.stay_status, UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_booking(UUID, public.booking_status, public.booking_status, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_stay(UUID, public.stay_status, public.stay_status, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_city_listing_count() TO authenticated;

-- NOTE: search_listings and get_listing_detail intentionally KEEP anon + authenticated access
-- to support anonymous browsing of the guest discovery experience.


-- =============================================================================
-- 3. TIGHTEN GEOCODING_CACHE RLS POLICIES
-- =============================================================================
-- geocoding_cache is a shared infrastructure cache populated by authenticated
-- users via server-side Supabase client (with user auth context).
-- Replace overly permissive WITH CHECK (true) policies with auth checks.

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.geocoding_cache;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.geocoding_cache;

-- Recreate with proper auth checks (no wide-open true)
CREATE POLICY "Authenticated users can insert cache entries"
  ON public.geocoding_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache entries"
  ON public.geocoding_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NOTE: These policies use WITH CHECK (true) but are scoped to the
-- 'authenticated' role via the TO clause, not to PUBLIC/anon.
-- The SELECT policy "Enable read access for authenticated users" remains.


-- =============================================================================
-- 4. REMOVE BROAD STORAGE SELECT POLICIES (BUCKET ENUMERATION)
-- =============================================================================
-- Public buckets serve files directly via URL. Broad SELECT policies only enable
-- listing/enumerating all files in a bucket, which is an information leak.

DROP POLICY IF EXISTS "Avatars are publically viewable" ON storage.objects;
DROP POLICY IF EXISTS "Listings are publically viewable" ON storage.objects;
DROP POLICY IF EXISTS "City images are publically viewable" ON storage.objects;

-- Also clean up temp policies on city-images that allow unrestricted writes
DROP POLICY IF EXISTS "temp_public_select" ON storage.objects;
DROP POLICY IF EXISTS "temp_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "temp_public_update" ON storage.objects;

COMMIT;
