BEGIN;

-- Wipe test notifications before schema transformation
TRUNCATE TABLE public.notifications;

-- Drop old columns
ALTER TABLE public.notifications
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS link,
  DROP COLUMN IF EXISTS data;

-- Add new architectural columns
ALTER TABLE public.notifications
  ADD COLUMN category TEXT NOT NULL,
  ADD COLUMN event_type TEXT NOT NULL,
  ADD COLUMN entity_type TEXT,
  ADD COLUMN entity_id UUID,
  ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN action_path TEXT,
  ADD COLUMN source_event_id UUID NOT NULL;

-- Keep user_id but ensure it references profiles
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add idempotency constraint
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_source_event_user_key UNIQUE (source_event_id, user_id);

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_notifications_source_user ON public.notifications (source_event_id, user_id);

COMMIT;
