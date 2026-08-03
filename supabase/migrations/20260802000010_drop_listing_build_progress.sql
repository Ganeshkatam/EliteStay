-- Drop listing_build_progress table and related policies/triggers as part of Phase 5 architectural refactor.
-- Progress and resume step are now dynamically computed via ListingHealthService.

DROP TABLE IF EXISTS public.listing_build_progress CASCADE;
