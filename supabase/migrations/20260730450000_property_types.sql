ALTER TABLE public.listings 
ADD COLUMN property_type TEXT DEFAULT 'Apartment' NOT NULL;

-- Recreate the RPC to include property_type
CREATE OR REPLACE FUNCTION public.get_listing_detail(p_public_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(l_data) INTO result
    FROM (
        SELECT 
            l.id,
            l.public_id,
            l.title,
            l.description,
            l.property_type,
            l.location,
            l.max_guests,
            l.status,
            l.created_at,
            (
                SELECT row_to_json(h)
                FROM (
                    SELECT 
                        p.id,
                        p.full_name,
                        p.avatar_url,
                        p.created_at
                    FROM public.profiles p
                    WHERE p.id = l.host_id
                ) h
            ) as host,
            (
                SELECT row_to_json(pr)
                FROM (
                    SELECT 
                        base_price_per_night,
                        cleaning_fee,
                        currency
                    FROM public.pricing
                    WHERE listing_id = l.id
                ) pr
            ) as pricing,
            (
                SELECT COALESCE(json_agg(row_to_json(img)), '[]'::json)
                FROM (
                    SELECT 
                        image_url,
                        display_order
                    FROM public.listing_images
                    WHERE listing_id = l.id
                    ORDER BY display_order ASC
                ) img
            ) as images,
            (
                SELECT COALESCE(json_agg(row_to_json(am)), '[]'::json)
                FROM (
                    SELECT 
                        a.name,
                        a.icon
                    FROM public.listing_amenities la
                    JOIN public.amenities a ON a.id = la.amenity_id
                    WHERE la.listing_id = l.id
                ) am
            ) as amenities
        FROM public.listings l
        WHERE l.public_id = p_public_id
        -- Ensure only published listings can be viewed, or bypass if the user is the owner/admin
        AND (
            l.status = 'published' 
            OR public.is_listing_owner(l.id) 
            OR public.is_admin()
        )
    ) l_data;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
