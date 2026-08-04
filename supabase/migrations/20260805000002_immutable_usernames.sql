-- 1. Create username generation function
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
    -- Derive base name
    IF raw_meta_data->>'full_name' IS NOT NULL AND raw_meta_data->>'full_name' != '' THEN
        base_name := raw_meta_data->>'full_name';
    ELSIF raw_meta_data->>'name' IS NOT NULL AND raw_meta_data->>'name' != '' THEN
        base_name := raw_meta_data->>'name';
    ELSIF user_email IS NOT NULL AND user_email != '' THEN
        base_name := split_part(user_email, '@', 1);
    ELSE
        base_name := 'user';
    END IF;

    -- Clean the base name: lowercase, remove non-alphanumeric
    clean_base := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure min length
    IF char_length(clean_base) < 3 THEN
        clean_base := clean_base || 'es';
    END IF;

    -- Ensure max length of base so suffix fits (max total 30)
    IF char_length(clean_base) > 24 THEN
        clean_base := left(clean_base, 24);
    END IF;

    attempt := clean_base;

    -- Avoid reserved words
    IF attempt = ANY(reserved_words) THEN
        attempt := attempt || 'user';
        clean_base := attempt;
    END IF;

    -- Loop to find unique username deterministically
    LOOP
        SELECT NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE username = attempt
        ) INTO is_unique;

        IF is_unique THEN
            RETURN attempt;
        END IF;

        counter := counter + 1;
        
        IF counter > 100 THEN
            -- Fallback to random suffix if over 100 attempts
            attempt := clean_base || substring(md5(random()::text) from 1 for 6);
        ELSE
            attempt := clean_base || counter::text;
        END IF;
    END LOOP;
END;
$$;

-- 2. Update existing trigger to use the new generator
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

-- 3. Backfill existing null usernames
DO $$
DECLARE
    r RECORD;
    new_username TEXT;
    u_email TEXT;
    u_meta JSONB;
BEGIN
    FOR r IN 
        SELECT p.id, au.email, au.raw_user_meta_data 
        FROM public.profiles p
        JOIN auth.users au ON p.id = au.id
        WHERE p.username IS NULL
    LOOP
        new_username := public.generate_unique_username(r.raw_user_meta_data, r.email);
        UPDATE public.profiles SET username = new_username WHERE id = r.id;
    END LOOP;
END;
$$;

-- 4. Apply schema enforcement
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Make sure to remove any existing check constraint to replace it
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- 5. Create immutability trigger
CREATE OR REPLACE FUNCTION public.protect_username_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.username IS DISTINCT FROM OLD.username THEN
        RAISE EXCEPTION 'Username is immutable and cannot be changed.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_username_immutability ON public.profiles;
CREATE TRIGGER enforce_username_immutability
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.protect_username_immutability();
