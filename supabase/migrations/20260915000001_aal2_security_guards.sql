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

-- Enforce AAL2 when modifying security settings if 2FA was already enabled
CREATE OR REPLACE FUNCTION public.guard_user_preferences_security_aal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If 2FA is active on the account, modifying the security column requires AAL2
  IF (OLD.security->>'two_factor_auth')::boolean IS TRUE AND NOT public.is_aal2_authenticated() AND NOT public.is_admin() THEN
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
