/*
==================================================
Domain: Extensions
Purpose: Enables PostgreSQL features required for the database.
Contains: 
- uuid-ossp
- pgcrypto
==================================================
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
