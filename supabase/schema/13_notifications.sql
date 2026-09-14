/*
==================================================
Domain: Notifications
Purpose: System alerts, booking notification triggers, and communication tracking.
Contains: 
- notifications
- RLS policies & performance indexes
==================================================
*/

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_path TEXT,
    source_event_id UUID NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT notifications_source_event_user_key UNIQUE (source_event_id, user_id)
);

-- Partial index for fast queries of unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id) WHERE read_at IS NULL;
-- Composite index for fetching all notifications sorted by timestamp
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
-- Index for idempotency checks
CREATE INDEX IF NOT EXISTS idx_notifications_source_user ON public.notifications (source_event_id, user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can mark own notifications as read" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
