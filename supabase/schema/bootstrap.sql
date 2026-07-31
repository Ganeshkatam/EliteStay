-- EliteStay Schema Bootstrap
-- Run this script via psql to initialize the complete database schema
-- Example: psql -h localhost -p 5432 -U postgres -d postgres -f bootstrap.sql

\echo 'Installing Extensions...'
\i 00_extensions.sql

\echo 'Creating Types...'
\i 01_types.sql

\echo 'Creating Shared Functions...'
\i 15_shared.sql

\echo 'Creating Identity Schema...'
\i 02_identity.sql

\echo 'Creating Accommodations Schema...'
\i 04_accommodations.sql

\echo 'Creating Listings Schema...'
\i 05_listings.sql

\echo 'Creating Listing Images Schema...'
\i 06_listing_images.sql

\echo 'Creating Pricing Schema...'
\i 07_pricing.sql

\echo 'Creating Bookings Schema...'
\i 09_bookings.sql

\echo 'Creating Stays Schema...'
\i 10_stays.sql

\echo 'Creating Reviews Schema...'
\i 11_reviews.sql

\echo 'Creating Storage Configuration...'
\i 14_storage.sql

\echo 'Creating Search Functions...'
\i 08_search.sql

\echo 'Done! Schema bootstrap complete.'

\echo 'Seeding Reference Data...'
\i 16_seed_reference_data.sql

\echo 'Seeding Demo Data...'
\i 17_seed_demo_data.sql

