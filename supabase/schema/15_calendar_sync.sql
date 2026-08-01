/*
==================================================
Domain: Calendar Sync & Automations
Purpose: Manage iCal feeds, external synchronization blocks, and pg_cron scheduled tasks.
Contains: 
- ical_feeds
- external_calendar_events
- triggers & RLS policies
- pg_cron sync scheduling
==================================================
*/

CREATE TABLE public.ical_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    feed_url TEXT NOT NULL,
    provider TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    sync_direction public.sync_direction DEFAULT 'import'::public.sync_direction NOT NULL,
    last_synced_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS ical_feeds_listing_idx ON public.ical_feeds(listing_id);

CREATE TRIGGER ical_feeds_updated_at 
  BEFORE UPDATE ON public.ical_feeds 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their ical feeds" ON public.ical_feeds
  FOR ALL USING (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE TABLE public.external_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id UUID REFERENCES public.ical_feeds(id) ON DELETE CASCADE NOT NULL,
    external_uid TEXT NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    summary TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(feed_id, external_uid)
);

CREATE INDEX IF NOT EXISTS external_events_listing_date_idx ON public.external_calendar_events(listing_id, start_date, end_date);

CREATE TRIGGER external_calendar_events_updated_at 
  BEFORE UPDATE ON public.external_calendar_events 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their external events" ON public.external_calendar_events
  FOR SELECT USING (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE POLICY "Hosts can manage their external events" ON public.external_calendar_events
  FOR ALL USING (public.is_listing_owner(listing_id) OR public.is_admin());

-- Schedule pg_cron sync job (Replace URLs and keys with actual environment values in deployment)
SELECT cron.schedule(
    'sync-ical-hourly',
    '0 * * * *',
    $$
    SELECT net.http_post(
        url:='YOUR_SUPABASE_PROJECT_URL/functions/v1/sync-ical',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
    $$
);
