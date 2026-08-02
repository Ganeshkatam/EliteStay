-- Add listing_count column to cities table
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS listing_count INTEGER DEFAULT 0 NOT NULL;

-- Create trigger function to update city listing count in real time
CREATE OR REPLACE FUNCTION public.update_city_listing_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'published' AND NEW.city_id IS NOT NULL) THEN
      UPDATE public.cities 
      SET listing_count = COALESCE(listing_count, 0) + 1 
      WHERE id = NEW.city_id;
    END IF;
  
  -- Handle UPDATE
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Case 1: Status changed to published
    IF (NEW.status = 'published' AND OLD.status <> 'published') THEN
      IF (NEW.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = COALESCE(listing_count, 0) + 1 
        WHERE id = NEW.city_id;
      END IF;
    -- Case 2: Status changed from published
    ELSIF (NEW.status <> 'published' AND OLD.status = 'published') THEN
      IF (OLD.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
        WHERE id = OLD.city_id;
      END IF;
    -- Case 3: Status remained published but city_id changed
    ELSIF (NEW.status = 'published' AND OLD.status = 'published' AND NEW.city_id IS DISTINCT FROM OLD.city_id) THEN
      IF (OLD.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
        WHERE id = OLD.city_id;
      END IF;
      IF (NEW.city_id IS NOT NULL) THEN
        UPDATE public.cities 
        SET listing_count = COALESCE(listing_count, 0) + 1 
        WHERE id = NEW.city_id;
      END IF;
    END IF;
  
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'published' AND OLD.city_id IS NOT NULL) THEN
      UPDATE public.cities 
      SET listing_count = GREATEST(0, COALESCE(listing_count, 0) - 1) 
      WHERE id = OLD.city_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_update_city_listing_count ON public.listings;
CREATE TRIGGER trg_update_city_listing_count
AFTER INSERT OR UPDATE OR DELETE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.update_city_listing_count();

-- Initial sync of listing counts
UPDATE public.cities c
SET listing_count = (
  SELECT count(*) 
  FROM public.listings l 
  WHERE l.city_id = c.id 
  AND l.status = 'published'
);
