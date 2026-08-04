-- Migration to add id column to host_profiles as primary key

-- Drop the existing primary key constraint on user_id
ALTER TABLE public.host_profiles DROP CONSTRAINT host_profiles_pkey CASCADE;

-- Add the new id column
ALTER TABLE public.host_profiles ADD COLUMN id UUID DEFAULT gen_random_uuid() NOT NULL;

-- Set id as the new primary key
ALTER TABLE public.host_profiles ADD PRIMARY KEY (id);

-- Ensure user_id remains unique
ALTER TABLE public.host_profiles ADD CONSTRAINT host_profiles_user_id_key UNIQUE (user_id);
