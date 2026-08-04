-- Add link column (already exists remotely but ensures consistency)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
