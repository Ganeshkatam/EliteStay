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
    username TEXT CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30 AND username ~ '^[a-z0-9_]+$'::text)),
    timezone TEXT
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
      "show_reviews": true,
      "allow_search_indexing": false
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_profile_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_identity_fields();

-- 7. Handle New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_storage_path, 
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    'guest'::public.user_role,
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
CREATE OR REPLACE FUNCTION public.delete_user_account()
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
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    DELETE FROM auth.users WHERE id = v_user_id;
    RETURN jsonb_build_object('success', true);
END;
$$;

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
