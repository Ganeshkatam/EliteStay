-- Add new fields for Profile Identity Hub redesign

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}'::TEXT[];

-- We don't need to change RLS because it is already handled.
