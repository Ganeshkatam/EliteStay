/*
==================================================
Domain: Calendar Sync (V1.2)
Purpose: Manage iCal feeds and synchronize external blocks.
Contains: 
- ical_feeds
- external_calendar_events
- triggers
- RLS
==================================================
*/

CREATE TYPE public.sync_direction AS ENUM ('import', 'export', 'both');

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

CREATE TRIGGER ical_feeds_updated_at 
  BEFORE UPDATE ON public.ical_feeds 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their ical feeds" ON public.ical_feeds
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = ical_feeds.listing_id 
        AND l.host_id = auth.uid()
    )
  );

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

CREATE TRIGGER external_calendar_events_updated_at 
  BEFORE UPDATE ON public.external_calendar_events 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their external events" ON public.external_calendar_events
  FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = external_calendar_events.listing_id 
        AND l.host_id = auth.uid()
    )
  );
