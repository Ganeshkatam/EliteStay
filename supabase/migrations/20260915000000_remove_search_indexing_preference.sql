-- Migration: Remove search indexing preference from user_preferences table
-- User profiles are strictly private and not accessible to the public.

-- 1. Update the default constraint on user_preferences.privacy
ALTER TABLE public.user_preferences 
  ALTER COLUMN privacy SET DEFAULT '{
    "allow_host_messages": true,
    "show_profile_photo": true,
    "show_reviews": true
  }'::jsonb;

-- 2. Clean up any existing rows by stripping 'allow_search_indexing' key from the privacy JSONB
UPDATE public.user_preferences
SET privacy = privacy - 'allow_search_indexing'
WHERE privacy ? 'allow_search_indexing';
