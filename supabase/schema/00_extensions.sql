/*
==================================================
Domain: Extensions
Purpose: Enables PostgreSQL extensions required by EliteStay.
Contains: 
- uuid-ossp
- pgcrypto
- pg_trgm
- btree_gist
- pg_cron
- pg_net
==================================================
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";
