-- Migration: create host_settings table

CREATE TABLE IF NOT EXISTS public.host_settings (
    host_profile_id UUID PRIMARY KEY REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    
    -- Localization Preferences
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    week_start_day SMALLINT NOT NULL DEFAULT 1,
    
    -- Visibility & Communication
    show_profile_publicly BOOLEAN NOT NULL DEFAULT true,
    allow_direct_messages BOOLEAN NOT NULL DEFAULT true,
    
    -- Automation
    auto_accept_booking_requests BOOLEAN NOT NULL DEFAULT false,
    
    -- Notification Preferences (Grouped)
    notify_email_bookings BOOLEAN NOT NULL DEFAULT true,
    notify_push_bookings BOOLEAN NOT NULL DEFAULT true,
    notify_sms_bookings BOOLEAN NOT NULL DEFAULT false,
    
    notify_email_messages BOOLEAN NOT NULL DEFAULT true,
    notify_push_messages BOOLEAN NOT NULL DEFAULT true,
    
    notify_email_system BOOLEAN NOT NULL DEFAULT true,
    notify_push_system BOOLEAN NOT NULL DEFAULT true,
    
    notify_email_marketing BOOLEAN NOT NULL DEFAULT false,
    notify_push_marketing BOOLEAN NOT NULL DEFAULT false,
    
    -- Future UI Preferences
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_host_settings_week_start CHECK (week_start_day BETWEEN 0 AND 6),
    CONSTRAINT chk_host_settings_language CHECK (language <> ''),
    CONSTRAINT chk_host_settings_currency CHECK (char_length(currency) = 3)
);

CREATE TRIGGER host_settings_updated_at 
  BEFORE UPDATE ON public.host_settings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.host_settings ENABLE ROW LEVEL SECURITY;

-- Least privilege RLS Policies
CREATE POLICY "Users can view their own host settings"
    ON public.host_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.host_profiles hp 
            WHERE hp.id = host_settings.host_profile_id 
            AND hp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own host settings"
    ON public.host_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.host_profiles hp 
            WHERE hp.id = host_settings.host_profile_id 
            AND hp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.host_profiles hp 
            WHERE hp.id = host_settings.host_profile_id 
            AND hp.user_id = auth.uid()
        )
    );
