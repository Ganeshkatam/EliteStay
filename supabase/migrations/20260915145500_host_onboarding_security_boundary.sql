-- Migration: Host Onboarding Security Boundary & Controlled State Transitions
-- Purpose: Add authoritative verification columns to host_profiles, create immutable host_policy_acceptances,
-- restrict column-level privileges, and implement locked SECURITY DEFINER RPCs for state transitions.

-- 1. Extend host_profiles with authoritative verification facts and constraints
ALTER TABLE public.host_profiles
    ADD COLUMN IF NOT EXISTS identity_submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS identity_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN IF NOT EXISTS identity_verification_ref TEXT,
    ADD COLUMN IF NOT EXISTS payout_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN IF NOT EXISTS payout_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS tax_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN IF NOT EXISTS tax_verified_at TIMESTAMPTZ;

-- Ensure valid verification states
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_host_profiles_identity_status'
    ) THEN
        ALTER TABLE public.host_profiles
            ADD CONSTRAINT chk_host_profiles_identity_status
            CHECK (identity_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_host_profiles_payout_status'
    ) THEN
        ALTER TABLE public.host_profiles
            ADD CONSTRAINT chk_host_profiles_payout_status
            CHECK (payout_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_host_profiles_tax_status'
    ) THEN
        ALTER TABLE public.host_profiles
            ADD CONSTRAINT chk_host_profiles_tax_status
            CHECK (tax_verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'));
    END IF;
END $$;

-- 2. Create append-only host_policy_acceptances table
CREATE TABLE IF NOT EXISTS public.host_policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID REFERENCES public.host_profiles(id) ON DELETE CASCADE NOT NULL,
    policy_type TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_host_policy_type CHECK (policy_type IN ('ANTI_DISCRIMINATION', 'MAINTENANCE_SLA'))
);

CREATE INDEX IF NOT EXISTS idx_host_policy_acceptances_host_type
    ON public.host_policy_acceptances(host_profile_id, policy_type, policy_version);

ALTER TABLE public.host_policy_acceptances ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT
DROP POLICY IF EXISTS "Hosts can read own policy acceptances" ON public.host_policy_acceptances;
CREATE POLICY "Hosts can read own policy acceptances"
    ON public.host_policy_acceptances
    FOR SELECT
    USING (
        host_profile_id IN (
            SELECT id FROM public.host_profiles WHERE user_id = auth.uid()
        )
    );

-- Strict privilege boundary for host_policy_acceptances: No direct INSERT/UPDATE/DELETE
REVOKE ALL ON public.host_policy_acceptances FROM PUBLIC, anon;
GRANT SELECT ON public.host_policy_acceptances TO authenticated;

-- 3. Restrict host_profiles privileges
REVOKE ALL ON public.host_profiles FROM PUBLIC, anon;
REVOKE UPDATE, DELETE ON public.host_profiles FROM authenticated;

-- Grant column-level UPDATE only on presentation fields
GRANT UPDATE (support_phone, support_email) ON public.host_profiles TO authenticated;
GRANT SELECT ON public.host_profiles TO authenticated;

-- 4. Controlled RPC: initialize_host_onboarding
CREATE OR REPLACE FUNCTION public.initialize_host_onboarding()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  INSERT INTO public.host_profiles (user_id, status)
  VALUES (v_user_id, 'ONBOARDING'::public.host_status)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.host_profiles
    WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'hostProfileId', v_profile_id,
    'status', (
      SELECT status::text
      FROM public.host_profiles
      WHERE id = v_profile_id
    )
  );
END;
$$;

-- 5. Controlled RPC: record_host_policy_acceptance
CREATE OR REPLACE FUNCTION public.record_host_policy_acceptance(
  p_policy_type text,
  p_policy_version text,
  p_client_context jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_host_profile_id uuid;
  v_acceptance_id uuid;
  v_server_context jsonb;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  IF p_policy_type IS NULL
     OR p_policy_type NOT IN ('ANTI_DISCRIMINATION', 'MAINTENANCE_SLA') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_POLICY_TYPE',
      'code', '400'
    );
  END IF;

  IF p_policy_version IS NULL
     OR length(btrim(p_policy_version)) NOT BETWEEN 1 AND 128 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_POLICY_VERSION',
      'code', '400'
    );
  END IF;

  SELECT id
    INTO v_host_profile_id
  FROM public.host_profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_host_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HOST_PROFILE_NOT_FOUND',
      'code', '404'
    );
  END IF;

  v_server_context := jsonb_build_object(
    'user_agent',
    current_setting('request.headers', true)::json->>'user-agent',
    'x_forwarded_for',
    split_part(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      ',',
      1
    )
  );

  INSERT INTO public.host_policy_acceptances (
    host_profile_id,
    policy_type,
    policy_version,
    client_context
  )
  VALUES (
    v_host_profile_id,
    p_policy_type,
    p_policy_version,
    jsonb_build_object(
      'declared', COALESCE(p_client_context, '{}'::jsonb),
      'request', COALESCE(v_server_context, '{}'::jsonb)
    )
  )
  RETURNING id INTO v_acceptance_id;

  RETURN jsonb_build_object(
    'success', true,
    'acceptanceId', v_acceptance_id
  );
END;
$$;

-- 6. Controlled RPC: transition_host_to_ready
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

  IF v_profile.identity_verification_status <> 'VERIFIED' THEN
    v_missing := array_append(v_missing, 'IDENTITY_NOT_VERIFIED');
  END IF;

  IF v_profile.payout_verification_status <> 'VERIFIED' THEN
    v_missing := array_append(v_missing, 'PAYOUT_NOT_VERIFIED');
  END IF;

  IF v_profile.tax_verification_status <> 'VERIFIED' THEN
    v_missing := array_append(v_missing, 'TAX_NOT_VERIFIED');
  END IF;

  IF v_profile.primary_accommodation_type_id IS NULL THEN
    v_missing := array_append(v_missing, 'SPECIALIZATION_NOT_SET');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'ANTI_DISCRIMINATION'
  ) THEN
    v_missing := array_append(v_missing, 'ANTI_DISCRIMINATION_POLICY_NOT_ACCEPTED');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.host_policy_acceptances hpa
    WHERE hpa.host_profile_id = v_profile.id
      AND hpa.policy_type = 'MAINTENANCE_SLA'
  ) THEN
    v_missing := array_append(v_missing, 'MAINTENANCE_SLA_POLICY_NOT_ACCEPTED');
  END IF;

  IF COALESCE(array_length(v_missing, 1), 0) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ELIGIBILITY_REQUIREMENTS_NOT_MET',
      'missing', v_missing
    );
  END IF;

  UPDATE public.host_profiles
  SET status = 'READY'::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status = 'ONBOARDING'::public.host_status;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'READY'
  );
END;
$$;

-- 7. Execute grants for the controlled RPCs
REVOKE ALL ON FUNCTION public.initialize_host_onboarding() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_host_policy_acceptance(text, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transition_host_to_ready() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.initialize_host_onboarding() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_host_policy_acceptance(text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_host_to_ready() TO authenticated;

-- 8. Controlled RPC: transition_host_to_active
CREATE OR REPLACE FUNCTION public.transition_host_to_active()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
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

  IF v_profile.status = 'ACTIVE'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'ACTIVE'
    );
  END IF;

  IF v_profile.status <> 'READY'::public.host_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'current_status', v_profile.status::text,
      'message', 'Host must be in READY status to activate',
      'code', '409'
    );
  END IF;

  UPDATE public.host_profiles
  SET status = 'ACTIVE'::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status = 'READY'::public.host_status;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'ACTIVE'
  );
END;
$$;

-- 9. Controlled RPC: transition_host_operational_status
CREATE OR REPLACE FUNCTION public.transition_host_operational_status(p_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_profile public.host_profiles%ROWTYPE;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'code', '401'
    );
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('ACTIVE', 'PAUSED') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_STATUS_TARGET',
      'message', 'Operational status can only toggle between ACTIVE and PAUSED',
      'code', '400'
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

  IF v_profile.status::text = p_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', p_status
    );
  END IF;

  IF v_profile.status NOT IN ('ACTIVE'::public.host_status, 'PAUSED'::public.host_status, 'READY'::public.host_status) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HOST_STATUS',
      'current_status', v_profile.status::text,
      'message', 'Host must be ACTIVE, PAUSED, or READY to toggle operational status',
      'code', '409'
    );
  END IF;

  UPDATE public.host_profiles
  SET status = p_status::public.host_status,
      updated_at = now()
  WHERE id = v_profile.id
    AND status IN ('ACTIVE'::public.host_status, 'PAUSED'::public.host_status, 'READY'::public.host_status);

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_STATUS_CHANGE',
      'code', '409'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', p_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transition_host_to_active() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transition_host_operational_status(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.transition_host_to_active() TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_host_operational_status(text) TO authenticated;
