-- Migration: Add Individual House & Remove Other
-- Purpose: Swaps "Other Residence" for "Individual House" as a core accommodation type.

DO $$
DECLARE
    other_id UUID;
    listing_count integer;
BEGIN
    -- 1. Insert Individual House
    INSERT INTO public.accommodation_types (id, name, slug, description, icon, display_order, is_active)
    VALUES (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
        'Individual House', 
        'house', 
        'Spacious independent houses and villas for complete privacy.', 
        'home', 
        45, 
        true
    )
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        display_order = EXCLUDED.display_order;

    -- 2. Safely remove Other Residence if it exists
    SELECT id INTO other_id FROM public.accommodation_types WHERE slug = 'other';

    IF other_id IS NOT NULL THEN
        SELECT COUNT(*) INTO listing_count FROM public.listings WHERE accommodation_type_id = other_id;

        IF listing_count > 0 THEN
            RAISE EXCEPTION 'Cannot remove Other Residence because % listings still reference it.', listing_count;
        END IF;

        DELETE FROM public.accommodation_types WHERE id = other_id;
    END IF;
END $$;
