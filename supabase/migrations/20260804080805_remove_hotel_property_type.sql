DO $$
DECLARE
    target_id integer;
    listing_count integer;
BEGIN
    -- Hotel is actually stored in property_types
    SELECT id
    INTO target_id
    FROM property_types
    WHERE slug = 'hotel' OR name = 'Hotel';

    IF target_id IS NULL THEN
        RETURN;
    END IF;

    SELECT COUNT(*)
    INTO listing_count
    FROM listings
    WHERE property_type_id = target_id;

    IF listing_count > 0 THEN
        RAISE EXCEPTION
        'Cannot remove Hotel property type because % listings still reference it.',
        listing_count;
    END IF;

    DELETE FROM property_types
    WHERE id = target_id;
END $$;
