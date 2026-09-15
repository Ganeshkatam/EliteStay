/*
==================================================
Domain: Identity & Preferences
Purpose: Everything related to users, roles, preferences, and authentication workflows.
Contains: 
- profiles
- user_preferences
- identity functions & triggers
- RLS policies
- account deletion workflow
==================================================
*/

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    full_name TEXT,
    avatar_storage_path TEXT,
    phone TEXT,
    role public.user_role DEFAULT 'guest'::public.user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    bio TEXT,
    date_of_birth DATE,
    gender public.gender,
    occupation public.user_occupation,
    username TEXT NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,30}$')
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. User Preferences Table
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    privacy JSONB NOT NULL DEFAULT '{
      "allow_host_messages": true,
      "show_profile_photo": true,
      "show_reviews": true
    }'::jsonb,
    notifications JSONB NOT NULL DEFAULT '{
      "email": true,
      "push": false,
      "sms": false,
      "marketing": false
    }'::jsonb,
    security JSONB NOT NULL DEFAULT '{
      "two_factor_auth": false,
      "allow_new_device_login": true,
      "remember_device": true
    }'::jsonb,
    hosting JSONB NOT NULL DEFAULT '{
      "accept_booking_requests": true,
      "instant_booking": false,
      "auto_approve_reservations": false
    }'::jsonb,
    communication JSONB NOT NULL DEFAULT '{
      "promotional_messages": false,
      "support_contact": true,
      "share_contact_after_booking": true
    }'::jsonb,
    data JSONB NOT NULL DEFAULT '{
      "share_analytics": false,
      "personalized_recommendations": true,
      "cookie_preferences": "essential"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Helper Functions (Defined early for use in RLS and triggers)
CREATE OR REPLACE FUNCTION public.is_host()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role = 'host'::public.user_role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'::public.user_role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- 4. RLS Policies for Profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 5. RLS Policies for User Preferences
CREATE POLICY "Users can read own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- 6. Profile Immutability Protection
CREATE OR REPLACE FUNCTION public.protect_identity_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.id = OLD.id;
    NEW.role = OLD.role;
    NEW.created_at = OLD.created_at;
  END IF;
  
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username is immutable and cannot be changed.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_profile_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_identity_fields();

-- Username Generator
CREATE OR REPLACE FUNCTION public.generate_unique_username(raw_meta_data JSONB, user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    base_name TEXT;
    clean_base TEXT;
    attempt TEXT;
    is_unique BOOLEAN;
    counter INTEGER := 1;
    reserved_words TEXT[] := ARRAY['admin', 'root', 'support', 'help', 'host', 'guest', 'users', 'login', 'signup', 'settings', 'notifications', 'messages', 'profile', 'api', 'system'];
BEGIN
    IF raw_meta_data->>'full_name' IS NOT NULL AND raw_meta_data->>'full_name' != '' THEN
        base_name := raw_meta_data->>'full_name';
    ELSIF raw_meta_data->>'name' IS NOT NULL AND raw_meta_data->>'name' != '' THEN
        base_name := raw_meta_data->>'name';
    ELSIF user_email IS NOT NULL AND user_email != '' THEN
        base_name := split_part(user_email, '@', 1);
    ELSE
        base_name := 'user';
    END IF;

    clean_base := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
    
    IF char_length(clean_base) < 3 THEN
        clean_base := clean_base || 'es';
    END IF;

    IF char_length(clean_base) > 24 THEN
        clean_base := left(clean_base, 24);
    END IF;

    attempt := clean_base;

    IF attempt = ANY(reserved_words) THEN
        attempt := attempt || 'user';
        clean_base := attempt;
    END IF;

    LOOP
        SELECT NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE username = attempt
        ) INTO is_unique;

        IF is_unique THEN
            RETURN attempt;
        END IF;

        counter := counter + 1;
        
        IF counter > 100 THEN
            attempt := clean_base || substring(md5(random()::text) from 1 for 6);
        ELSE
            attempt := clean_base || counter::text;
        END IF;
    END LOOP;
END;
$$;

-- 7. Handle New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    generated_username TEXT;
BEGIN
  generated_username := public.generate_unique_username(NEW.raw_user_meta_data, NEW.email);

  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_storage_path, 
    role,
    username,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    'guest'::public.user_role,
    generated_username,
    NOW(),
    NOW()
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Updated_at Triggers
CREATE TRIGGER profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 9. Account Deletion RPC and Triggers
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'UNAUTHENTICATED',
            'code', '401',
            'message', 'User must be authenticated to request account deletion'
        );
    END IF;
    
    BEGIN
        DELETE FROM auth.users WHERE id = v_user_id;
        RETURN jsonb_build_object(
            'success', true,
            'user_id', v_user_id,
            'message', 'Account successfully scheduled for immediate deletion'
        );
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'DEPENDENCY_DELETE_BLOCKED',
                'code', '23503',
                'message', SQLERRM
            );
        WHEN others THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'ACCOUNT_DELETION_FAILED',
                'code', SQLSTATE,
                'message', SQLERRM
            );
    END;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Forward to canonical domain deletion procedure
    RETURN public.request_account_deletion();
END;
$$;

ALTER FUNCTION public.request_account_deletion() OWNER TO postgres;
ALTER FUNCTION public.delete_user_account() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.request_account_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_account_deletion() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO postgres, authenticated;

CREATE OR REPLACE FUNCTION public.handle_user_delete_cleanup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.stays
    SET created_by = NULL
    WHERE created_by = OLD.id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_on_user_delete_cleanup ON auth.users;
CREATE TRIGGER tr_on_user_delete_cleanup
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_user_delete_cleanup();

-- User Privacy Anonymization Trigger
CREATE OR REPLACE FUNCTION public.anonymize_user_applicant_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.applicant_profiles WHERE guest_id = OLD.id) THEN
    UPDATE public.applicant_profiles
    SET 
      employment_status = 'ANONYMIZED',
      student_status = 'ANONYMIZED',
      income_range = 'ANONYMIZED',
      pet_information = NULL,
      guarantor_information = NULL,
      smoking_preference = NULL,
      updated_at = NOW()
    WHERE guest_id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_anonymize_user_applicant_profile ON auth.users;
CREATE TRIGGER trg_anonymize_user_applicant_profile
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_user_applicant_profile();

-- User Deletion Guard (Symmetric Tenant & Host Protection)
CREATE OR REPLACE FUNCTION public.prevent_protected_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Tenant Check 1: Active or historical lease contract
  IF EXISTS (
    SELECT 1 FROM public.leases
    WHERE tenant_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has active or historical lease contracts on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 2: Active or historical resident stay
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE guest_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has active or historical resident stay records on file.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 3: Submitted reviews (immutable public reputation)
  IF EXISTS (
    SELECT 1 FROM public.reviews
    WHERE guest_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has submitted public reviews on record. Reviews are permanent historical records.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 4: Financial accounts
  IF EXISTS (
    SELECT 1 FROM public.accounts
    WHERE tenant_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has financial ledger accounts on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 5: Active or historical maintenance requests
  IF EXISTS (
    SELECT 1 FROM public.maintenance_requests
    WHERE resident_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has active or historical maintenance requests on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Statutory Audit Check 1: Lease contract versions authored
  IF EXISTS (
    SELECT 1 FROM public.lease_versions
    WHERE created_by = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user is recorded as creator of statutory lease contract versions.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Statutory Audit Check 2: Documents uploaded
  IF EXISTS (
    SELECT 1 FROM public.documents
    WHERE uploaded_by = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has uploaded statutory tenancy documents on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 1: Any property referenced by a lease
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.bookings b ON b.listing_id = l.id
    JOIN public.leases le ON le.reservation_id = b.id
    WHERE l.host_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties referenced by legal lease contracts. Properties must be archived, not deleted.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 2: Any property referenced by a stay
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.stays s ON s.listing_id = l.id
    WHERE l.host_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties with resident stay records on file. Properties must be archived, not deleted.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 3: Any property with public reviews
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.reviews r ON r.listing_id = l.id
    WHERE l.host_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties with public review records on file. Properties must be archived, not deleted.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 4: Active bookings
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.bookings b ON b.listing_id = l.id
    WHERE l.host_id = OLD.id AND b.status::text IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties with active booking reservations.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_user_deletion ON auth.users;
CREATE TRIGGER trg_prevent_protected_user_deletion
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_protected_user_deletion();

ALTER FUNCTION public.prevent_protected_user_deletion() OWNER TO postgres;
ALTER FUNCTION public.anonymize_user_applicant_profile() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.prevent_protected_user_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anonymize_user_applicant_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_protected_user_deletion() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_user_applicant_profile() TO postgres, authenticated;

