-- EliteStay Schema Bootstrap
-- Run this script via psql to initialize the complete database schema in exact dependency order.
-- Example: psql -h localhost -p 5432 -U postgres -d postgres -f bootstrap.sql

\echo 'Installing Extensions...'
\i 00_extensions.sql

\echo 'Creating Types & Enums...'
\i 01_types.sql

\echo 'Creating Shared Functions...'
\i 02_shared_functions.sql

\echo 'Creating Identity & User Preferences Schema...'
\i 03_identity.sql

\echo 'Creating Geography Schema...'
\i 04_geography.sql

\echo 'Creating Accommodations Reference Schema...'
\i 05_accommodations.sql

\echo 'Creating Listings Schema...'
\i 06_listings.sql

\echo 'Creating Listing Images Schema...'
\i 07_listing_images.sql

\echo 'Creating Listing Pricing Schema...'
\i 08_listing_pricing.sql

\echo 'Creating Listing Availability Schema...'
\i 09_listing_availability.sql

\echo 'Creating Bookings Schema...'
\i 10_bookings.sql

\echo 'Creating Stays Schema...'
\i 11_stays.sql

\echo 'Creating Reviews Schema...'
\i 12_reviews.sql

\echo 'Creating Notifications Schema...'
\i 13_notifications.sql

\echo 'Creating Messaging Schema...'
\i 14_messaging.sql

\echo 'Creating Calendar Sync Schema...'
\i 15_calendar_sync.sql

\echo 'Creating Storage Buckets & Policies...'
\i 16_storage_buckets.sql

\echo 'Creating Search Functions...'
\i 17_search_functions.sql

\echo 'Seeding Reference Data...'
\i 18_seed_reference_data.sql
