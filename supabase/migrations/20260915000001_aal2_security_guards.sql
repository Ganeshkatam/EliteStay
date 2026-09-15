-- Migration: 20260915000001_aal2_security_guards.sql
-- Purpose: Add SQL helper for AAL2 assurance level and trigger guard on user_preferences security column.

CREATE OR REPLACE FUNCTION public.is_aal2_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'aal') = 'aal2',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.guard_user_preferences_security_aal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_has_verified_factors BOOLEAN;
BEGIN
  -- Check if user currently has verified MFA factors in Supabase Auth
  SELECT EXISTS (
    SELECT 1 FROM auth.mfa_factors
    WHERE user_id = NEW.user_id
      AND status = 'verified'
  ) INTO v_has_verified_factors;

  -- If verified factors exist, mutating security requires AAL2 or admin
  -- (If user has unenrolled their factors, this allows updating preference to false)
  IF v_has_verified_factors AND NOT public.is_aal2_authenticated() AND NOT public.is_admin() THEN
    -- If user is completing enrollment (factor verified, turning 2fa true), allow syncing preference
    IF (NEW.security->>'two_factor_auth')::boolean IS TRUE AND (OLD.security->>'two_factor_auth')::boolean IS NOT TRUE THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Two-Factor Authentication (AAL2) required to modify security preferences.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_preferences_security_aal ON public.user_preferences;
CREATE TRIGGER trg_guard_user_preferences_security_aal
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  WHEN (NEW.security IS DISTINCT FROM OLD.security)
  EXECUTE FUNCTION public.guard_user_preferences_security_aal();
