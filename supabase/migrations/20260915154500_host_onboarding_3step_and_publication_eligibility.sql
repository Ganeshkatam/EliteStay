-- Migration: 20260915154500_host_onboarding_3step_and_publication_eligibility.sql
-- Description: Updates transition_host_to_ready() to strictly evaluate the 3 onboarding requirements (Identity submitted, Specialization selected, Mandatory policies accepted).

CREATE OR REPLACE FUNCTION public.transition_host_to_ready()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
  v_missing text[] := ARRAY[]::text[];
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  SELECT *
    INTO v_profile
  FROM public.host_profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HOST_PROFILE_NOT_FOUND',
      'code', '404'
    );
  END IF;

  IF v_profile.status IN ('READY'::public.host_status, 'ACTIVE'::public.host_status) THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', v_profile.status::text
    );
  END IF;

  IF v_profile.status <> 'ONBOARDING'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'status', v_profile.status::text,
      'code', '409'
    );
  END IF;

  -- 1. Onboarding Requirement 1: Identity Submitted
  IF v_profile.identity_submitted_at IS NULL THEN
    v_missing := array_append(v_missing, 'IDENTITY_NOT_SUBMITTED');
  END IF;

  -- 2. Onboarding Requirement 2: Accommodation Specialization Selected
  IF v_profile.primary_accommodation_type_id IS NULL THEN
    v_missing := array_append(v_missing, 'SPECIALIZATION_NOT_SET');
  END IF;

  -- 3. Onboarding Requirement 3: Mandatory Policies Accepted
  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'ANTI_DISCRIMINATION'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'ANTI_DISCRIMINATION_POLICY_NOT_ACCEPTED');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'MAINTENANCE_SLA'
      AND hpa.policy_version = '2026.1'
  ) THEN
    v_missing := array_append(v_missing, 'MAINTENANCE_SLA_POLICY_NOT_ACCEPTED');
  END IF;

  IF COALESCE(array_length(v_missing, 1), 0) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ONBOARDING_REQUIREMENTS_NOT_MET',
      'missing', v_missing
    );
  END IF;

  UPDATE public.host_profiles
  SET status = 'READY'::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'READY'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.transition_host_to_ready() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.transition_host_to_ready() FROM anon, public;
