-- 20260731090000_rpc_search_listings.sql
--
-- Server-side search RPC with full filtering, sorting, and pagination.
-- Returns TABLE rows (not JSON) with COUNT(*) OVER() for pagination metadata.
-- Filters by accommodation_type_id (UUID) for efficient index lookups.

CREATE OR REPLACE FUNCTION public.search_listings(
  p_city TEXT DEFAULT NULL,
  p_locality TEXT DEFAULT NULL,
  p_accommodation_type_id UUID DEFAULT NULL,
  p_furnishing furnishing DEFAULT NULL,
  p_gender_preference gender_preference DEFAULT NULL,
  p_occupancy_type occupancy_type DEFAULT NULL,
  p_billing_period billing_period DEFAULT NULL,
  p_amenities TEXT[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_available_from DATE DEFAULT NULL,
  p_sort TEXT DEFAULT 'recommended',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 12
)
RETURNS TABLE (
  total_count BIGINT,
  listing_id UUID,
  public_id TEXT,
  title TEXT,
  accommodation_type_name TEXT,
  furnishing furnishing,
  gender_preference gender_preference,
  occupancy_type occupancy_type,
  max_occupants INTEGER,
  locality TEXT,
  city TEXT,
  country TEXT,
  formatted_address TEXT,
  price_amount NUMERIC,
  price_currency TEXT,
  price_billing_period billing_period,
  price_minimum_duration INTEGER,
  image_url TEXT
)
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
    l.max_occupants,
    l.locality,
    l.city,
    l.country,
    l.formatted_address,
    lp.amount AS price_amount,
    lp.currency AS price_currency,
    lp.billing_period AS price_billing_period,
    lp.minimum_duration AS price_minimum_duration,
    (
      SELECT li.storage_path
      FROM public.listing_images li
      WHERE li.listing_id = l.id
      ORDER BY li.display_order ASC
      LIMIT 1
    ) AS image_url
  FROM public.listings l
  JOIN public.accommodation_types at ON at.id = l.accommodation_type_id
  LEFT JOIN public.listing_prices lp ON lp.listing_id = l.id
  WHERE
    -- Only published listings
    l.status = 'published'

    -- Location filters (ILIKE for V1; will move to ID-based in V2)
    AND (p_city IS NULL OR l.city ILIKE p_city)
    AND (p_locality IS NULL OR l.locality ILIKE p_locality)

    -- Accommodation type filter (UUID-based)
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
          AND la.available_from <= p_available_from
      )
    )

    -- Amenities filter: listing must have ALL requested amenities
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
    CASE WHEN p_sort = 'price_asc' THEN lp.amount END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_desc' THEN lp.amount END DESC NULLS LAST,
    CASE WHEN p_sort = 'newest' THEN l.created_at END DESC,
    -- 'recommended' (default): newest first for V1.
    -- Will evolve to composite ranking (featured + rating + recency)
    -- once those columns exist.
    CASE WHEN p_sort = 'recommended' OR p_sort IS NULL THEN l.created_at END DESC

  LIMIT p_page_size
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
