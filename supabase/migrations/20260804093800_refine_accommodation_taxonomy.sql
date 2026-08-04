-- Migration: Refine Canonical Accommodation Taxonomy
-- Purpose: Freezes the accommodation_types table as a pure reference catalog with 5 categories (PG, Hostel, Apartment, Co-living, Other Residence).

DO $$
DECLARE
    sh_id UUID;
    listing_count integer;
BEGIN
    -- 1. Safely remove Student Housing if it exists
    SELECT id INTO sh_id FROM public.accommodation_types WHERE slug = 'student-housing';

    IF sh_id IS NOT NULL THEN
        SELECT COUNT(*) INTO listing_count FROM public.listings WHERE accommodation_type_id = sh_id;

        IF listing_count > 0 THEN
            RAISE EXCEPTION 'Cannot remove Student Housing because % listings still reference it.', listing_count;
        END IF;

        DELETE FROM public.accommodation_types WHERE id = sh_id;
    END IF;

    -- 2. Update existing categories to their new canonical definitions
    
    -- PG
    UPDATE public.accommodation_types 
    SET display_order = 10, icon = 'users', description = 'Shared paying guest accommodation with optional meals and managed services.'
    WHERE slug = 'pg';

    -- Hostel
    UPDATE public.accommodation_types 
    SET display_order = 20, icon = 'building', description = 'Shared hostel accommodation for students and working professionals.'
    WHERE slug = 'hostel';

    -- Apartment
    UPDATE public.accommodation_types 
    SET display_order = 30, icon = 'building-2', description = 'Independent apartments and flats for long-term living.'
    WHERE slug = 'apartment';

    -- Co-living
    UPDATE public.accommodation_types 
    SET display_order = 40, icon = 'users-round', description = 'Professionally managed shared living spaces with community amenities.', name = 'Co-living'
    WHERE slug = 'coliving';

    -- Other Residence
    UPDATE public.accommodation_types 
    SET display_order = 50, icon = 'home', description = 'Specialized residential living facilities and unique accommodations.'
    WHERE slug = 'other';

END $$;
