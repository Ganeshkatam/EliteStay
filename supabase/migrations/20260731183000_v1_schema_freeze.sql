-- V1 Schema Freeze Migration

-- 1. Profiles: Add new nullable columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT;

-- 1b. Profiles: Username constraints and index
ALTER TABLE public.profiles 
  ADD CONSTRAINT username_format CHECK (
    username IS NULL OR 
    (char_length(username) BETWEEN 3 AND 30 AND username ~ '^[a-z0-9_]+$')
  );

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx 
  ON public.profiles (username);

-- 2. Profiles: Rename avatar_path to avatar_storage_path
-- Using IF EXISTS to make it idempotent (in case it was already run)
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='profiles' and column_name='avatar_path')
  THEN
      ALTER TABLE public.profiles RENAME COLUMN avatar_path TO avatar_storage_path;
  END IF;
END $$;

-- 3. User Preferences: Add new fields with defaults
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS appearance JSONB NOT NULL DEFAULT '{"theme": "system", "density": "comfortable", "animations": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS preferences_version INTEGER NOT NULL DEFAULT 1;
