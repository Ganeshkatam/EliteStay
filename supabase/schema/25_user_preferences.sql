/*
==================================================
Domain: User Preferences
Purpose: Stores customizable user settings independently across various categories.
==================================================
*/

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

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own preferences" 
ON public.user_preferences
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.user_preferences
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Backfill existing users
INSERT INTO public.user_preferences (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (
    SELECT user_id
    FROM public.user_preferences
);
