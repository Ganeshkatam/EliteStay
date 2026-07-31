# EliteStay Schema

This directory contains the canonical V1 baseline schema for EliteStay, organized by domain. 

## Source of Truth

**This `supabase/schema/` directory is the single source of truth for the database schema.** 
The initial migration file (`supabase/migrations/00000000000000_initial_schema.sql`) is a generated build artifact. **Do not edit the migration file directly.**

### Build Workflow

If you modify any SQL in this `schema/` directory, you must regenerate the initial migration artifact to keep it in sync:

```bash
npm run db:build
```
*(This executes `build_migration.js`, which concatenates the domains in the exact execution order.)*

## Structure & Ownership

The schema is broken down into domain-specific files, prefixed with numbers to ensure the correct execution dependency order. Each file strictly owns the tables, triggers, RPCs, and RLS policies for that specific domain.

### 1. Foundation
- `00_extensions.sql`: PostgreSQL extensions (uuid-ossp, pgcrypto).
- `01_types.sql`: Global ENUMs and types.
- `15_shared.sql`: Shared utility functions (e.g., `handle_updated_at()`).

### 2. Identity
- `02_identity.sql`: User profiles and authentication triggers (`is_host()`, `is_admin()`, profile immutability).

### 3. Listings (The Core Product)
- `04_accommodations.sql`: Reference entities like accommodation types and amenities.
- `05_listings.sql`: The primary `listings` table and `listing_build_progress`.
- `06_listing_images.sql`: Listing image gallery, cover tracking, and image sequencing.
- `07_pricing.sql`: Real-world financial constraints, billing periods, deposits, and fees.

### 4. Search & Discovery
- `08_search.sql`: Dedicated read models and RPCs (`search_listings()`, `get_listing_detail()`). Keeps heavy querying logic separate from data storage tables.

### 5. Booking Workflow (The Lifecycle)
- `09_bookings.sql`: Tenant requests, booking status (`pending`, `approved`, `rejected`), and base listing availability constraints.
- `10_stays.sql`: The active tenancy records generated from an approved booking (move-in/move-out, active state tracking).
- `11_reviews.sql`: Post-stay feedback tied strictly to the `stays` table.

### 6. Infrastructure & Seed Data
- `14_storage.sql`: Supabase storage buckets and RLS for binary blobs (listings, avatars).
- `16_seed_reference_data.sql`: Immutable default values (e.g., base amenities, standard accommodation types).
- `17_seed_demo_data.sql`: (Optional) Sandbox entities for local development.

*(Note: Files 03, 12, and 13 are reserved for future domains like locations, hosting operations, and administration).*

## Execution Dependency Graph

The script applies files in strict numeric order. The fundamental dependency rules are:
1. **Extensions & Types** must exist before any tables.
2. **Shared Utilities** must exist before triggers are attached to tables.
3. **Identity** must exist before `listings` can assign a `host_id`.
4. **Listings** must exist before `pricing`, `images`, or `bookings` can reference a `listing_id`.
5. **Bookings** must exist before a `stay` can be derived.
6. **Stays** must exist before a `review` can be submitted.
7. **Search RPCs** must exist last, as they query across multiple domains.

## Conventions

- **Default Deny**: Every table must have `ENABLE ROW LEVEL SECURITY`.
- **Auditing**: Every table must have `created_at` and `updated_at`, driven by the `handle_updated_at()` trigger.
- **Prefixes**: Always prefix domain files with two-digit numbers. If splitting a domain (e.g. `09_bookings.sql` into requests, payments, etc.), use logical increments or alphanumeric suffixes (e.g. `09_booking_requests.sql`, `10_booking_payments.sql`).
- **Idempotency**: Use `CREATE OR REPLACE` for functions/triggers and `IF NOT EXISTS` where appropriate.

## Bootstrapping (Local DB Init)

To fully reset and initialize the database structure locally (bypassing migrations if desired):

```bash
psql -h localhost -p 5432 -U postgres -d postgres -f bootstrap.sql
```
