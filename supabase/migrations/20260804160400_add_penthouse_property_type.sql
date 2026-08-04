-- Migration: Add Penthouse Property Type
-- Purpose: Adds "Penthouse" as a property style reference attribute.

INSERT INTO public.property_types (id, name, slug, description, icon, display_order)
VALUES (
    11, 
    'Penthouse', 
    'penthouse', 
    'Luxury top-floor apartment with panoramic views', 
    'building', 
    11
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;
