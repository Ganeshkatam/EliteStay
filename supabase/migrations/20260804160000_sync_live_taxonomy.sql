-- Migration: Sync Live Taxonomy
-- Purpose: Ensures the local database taxonomy exactly matches the live database.

DO $$
BEGIN
    -- Ensure exactly these 7 items exist with correct properties
    INSERT INTO public.accommodation_types (id, name, slug, description, icon, display_order, is_active) VALUES
      ('147a6d96-47d0-428a-b541-6d83a82def8c', 'Paying Guest', 'pg', 'Shared paying guest accommodation with optional meals and managed services.', 'users', 10, true),
      ('24aac50b-0999-49d2-9487-07c1b5068283', 'Hostel', 'hostel', 'Shared hostel accommodation for students and working professionals.', 'building', 20, true),
      ('21cc18a1-ba31-4ede-89f4-2c8c15a53122', 'Apartment', 'apartment', 'Independent apartments and flats for long-term living.', 'building-2', 40, true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Serviced Apartment', 'serviced-apartment', 'Fully furnished apartments with inclusive management and utilities.', 'hotel', 50, true),
      ('2c6e8ec1-7fda-4dee-8583-457ae38e584c', 'Co-living', 'coliving', 'Professionally managed shared living spaces with community amenities.', 'users-round', 60, true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Independent House', 'house', 'Spacious independent houses and villas for complete privacy.', 'home', 70, true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Villa', 'villa', 'Premium, spacious private estates for luxury long-term living.', 'palmtree', 80, true)
    ON CONFLICT (id) DO UPDATE SET 
      name = EXCLUDED.name, 
      slug = EXCLUDED.slug,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      display_order = EXCLUDED.display_order;

    -- Clean up any other types (e.g. studio, other) that shouldn't be here
    DELETE FROM public.accommodation_types 
    WHERE id NOT IN (
        '147a6d96-47d0-428a-b541-6d83a82def8c',
        '24aac50b-0999-49d2-9487-07c1b5068283',
        '21cc18a1-ba31-4ede-89f4-2c8c15a53122',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        '2c6e8ec1-7fda-4dee-8583-457ae38e584c',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'
    );
END $$;
