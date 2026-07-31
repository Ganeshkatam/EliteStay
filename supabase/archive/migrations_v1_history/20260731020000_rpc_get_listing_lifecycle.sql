-- 20260731020000_rpc_get_listing_lifecycle.sql

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
            l.max_occupants,
            l.status,
            l.created_at,
            l.country_code,
            l.country,
            l.state,
            l.city,
            l.locality,
            l.postal_code,
            l.latitude,
            l.longitude,
            l.formatted_address,
            (
                SELECT row_to_json(t)
                FROM (
                    SELECT name, description
                    FROM public.listing_types
                    WHERE id = l.type_id
                ) t
            ) as property_type,
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
                        amount,
                        currency,
                        billing_period,
                        security_deposit,
                        maintenance_fee,
                        minimum_duration,
                        maximum_duration
                    FROM public.listing_prices
                    WHERE listing_id = l.id
                ) pr
            ) as pricing,
            (
                SELECT row_to_json(av)
                FROM (
                    SELECT 
                        available_from,
                        available_units,
                        status
                    FROM public.listing_availability
                    WHERE listing_id = l.id
                ) av
            ) as availability,
            (
                SELECT COALESCE(json_agg(row_to_json(img)), '[]'::json)
                FROM (
                    SELECT 
                        storage_path as image_url,
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
        AND (
            l.status = 'published' 
            OR public.is_listing_owner(l.id) 
            OR public.is_admin()
        )
    ) l_data;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
