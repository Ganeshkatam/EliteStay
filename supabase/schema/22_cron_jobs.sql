/*
==================================================
Domain: Calendar Sync (V1.2)
Purpose: Schedule pg_cron to trigger the sync-ical edge function.
Contains: 
- pg_cron schedule
==================================================
*/

-- Ensure pg_cron and pg_net extensions are available.
-- (Note: In Supabase, these are enabled via the dashboard or 00_extensions.sql, 
-- but we include them here for completeness).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the sync job to run every hour.
-- IMPORTANT: You must replace 'YOUR_SUPABASE_PROJECT_URL' and 'YOUR_ANON_KEY' 
-- with your actual project URL and anon/service_role key.
-- In a production Supabase project, you would store the URL and KEY securely 
-- or use Vault to retrieve them.

SELECT cron.schedule(
    'sync-ical-hourly',
    '0 * * * *', -- Run at minute 0 past every hour
    $$
    SELECT net.http_post(
        url:='YOUR_SUPABASE_PROJECT_URL/functions/v1/sync-ical',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
    $$
);
