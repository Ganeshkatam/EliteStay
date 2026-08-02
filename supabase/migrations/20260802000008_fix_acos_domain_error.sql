/*
==================================================
Migration: Fix acos domain error in search_listings
Purpose:
  Prevent ERROR: 22003: input is out of range when center_lat/lng precisely matches a listing,
  which causes the Haversine formula to pass a value slightly > 1.0 to acos() due to float inaccuracies.
==================================================
*/

CREATE OR REPLACE FUNCTION public.search_listings(
  p_city TEXT DEFAULT NULL,
  p_locality TEXT DEFAULT NULL,
  p_accommodation_type_id UUID DEFAULT NULL,
  p_furnishing public.furnishing DEFAULT NULL,
  p_gender_preference public.gender_preference DEFAULT NULL,
  p_occupancy_type public.occupancy_type DEFAULT NULL,
  p_billing_period public.billing_period DEFAULT NULL,
  p_amenities TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_available_from DATE DEFAULT NULL,
  p_sort TEXT DEFAULT 'recommended',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 12,
  p_min_lat DOUBLE PRECISION DEFAULT NULL,
  p_max_lat DOUBLE PRECISION DEFAULT NULL,
  p_min_lng DOUBLE PRECISION DEFAULT NULL,
  p_max_lng DOUBLE PRECISION DEFAULT NULL,
  p_center_lat DOUBLE PRECISION DEFAULT NULL,
  p_center_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  total_count BIGINT,
  listing_id UUID,
  public_id TEXT,
  title TEXT,
  accommodation_type_name TEXT,
  furnishing public.furnishing,
  gender_preference public.gender_preference,
  occupancy_type public.occupancy_type,
  locality TEXT,
  city TEXT,
  formatted_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_amount NUMERIC,
  price_currency TEXT,
  price_billing_period public.billing_period,
  price_minimum_duration INTEGER,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INTEGER;
BEGIN
  -- Clamp pagination values
  IF p_page < 1 THEN p_page := 1; END IF;
  IF p_page_size < 1 THEN p_page_size := 12; END IF;
  IF p_page_size > 48 THEN p_page_size := 48; END IF;

  v_offset := (p_page - 1) * p_page_size;

  RETURN QUERY
  SELECT
    COUNT(*) OVER() AS total_count,
    l.id AS listing_id,
    l.public_id,
    l.title,
    at.name AS accommodation_type_name,
    l.furnishing,
    l.gender_preference,
    l.occupancy_type,
    l.locality,
    l.city,
    l.formatted_address,
    l.latitude,
    l.longitude,
    lp.amount AS price_amount,
    lp.currency AS price_currency,
    lp.billing_period AS price_billing_period,
    lp.minimum_duration AS price_minimum_duration,
    (
      SELECT li.storage_path
      FROM public.listing_images li
      WHERE li.listing_id = l.id
      ORDER BY li.is_cover DESC, li.display_order ASC
      LIMIT 1
    ) AS image_url
  FROM public.listings l
  JOIN public.accommodation_types at ON at.id = l.accommodation_type_id
  JOIN public.listing_prices lp ON lp.listing_id = l.id
  WHERE
    -- Only published listings
    l.status = 'published'

    -- Location text filters
    AND (p_city IS NULL OR l.city ILIKE p_city)
    AND (p_locality IS NULL OR l.locality ILIKE p_locality)

    -- Map bounding box filters
    AND (p_min_lat IS NULL OR l.latitude >= p_min_lat)
    AND (p_max_lat IS NULL OR l.latitude <= p_max_lat)
    AND (p_min_lng IS NULL OR l.longitude >= p_min_lng)
    AND (p_max_lng IS NULL OR l.longitude <= p_max_lng)

    -- Accommodation type filter
    AND (p_accommodation_type_id IS NULL OR l.accommodation_type_id = p_accommodation_type_id)

    -- Property attribute filters
    AND (p_furnishing IS NULL OR l.furnishing = p_furnishing)
    AND (p_gender_preference IS NULL OR l.gender_preference = p_gender_preference)
    AND (p_occupancy_type IS NULL OR l.occupancy_type = p_occupancy_type)

    -- Billing period filter
    AND (p_billing_period IS NULL OR lp.billing_period = p_billing_period)

    -- Price range filters
    AND (p_min_price IS NULL OR lp.amount >= p_min_price)
    AND (p_max_price IS NULL OR lp.amount <= p_max_price)

    -- Availability filter
    AND (
      p_available_from IS NULL
      OR EXISTS (
        SELECT 1 FROM public.listing_availability la
        WHERE la.listing_id = l.id
          AND la.status = 'available'
          AND la.start_date <= p_available_from
      )
    )

    -- Amenities filter
    AND (
      p_amenities IS NULL
      OR array_length(p_amenities, 1) IS NULL
      OR NOT EXISTS (
        SELECT unnest(p_amenities)
        EXCEPT
        SELECT a.name
        FROM public.listing_amenities la2
        JOIN public.amenities a ON a.id = la2.amenity_id
        WHERE la2.listing_id = l.id
      )
    )

  ORDER BY
    CASE WHEN p_sort = 'distance' AND p_center_lat IS NOT NULL AND p_center_lng IS NOT NULL THEN
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_center_lat)) * cos(radians(l.latitude)) *
          cos(radians(l.longitude) - radians(p_center_lng)) +
          sin(radians(p_center_lat)) * sin(radians(l.latitude))
        ))
      )
    END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_asc' THEN lp.amount END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_desc' THEN lp.amount END DESC NULLS LAST,
    CASE WHEN p_sort = 'newest' THEN l.created_at END DESC,
    CASE WHEN p_sort = 'recommended' OR (p_sort NOT IN ('price_asc', 'price_desc', 'newest', 'distance')) THEN l.created_at END DESC

  LIMIT p_page_size
  OFFSET v_offset;
END;
$$;
