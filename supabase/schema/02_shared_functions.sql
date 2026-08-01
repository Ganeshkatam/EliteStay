/*
==================================================
Domain: Shared Functions
Purpose: Cross-cutting utilities and shared functions.
Contains: 
- updated_at trigger helper
- public_id generator
- public_id immutability triggers
==================================================
*/

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

/*
  uuid_to_public_id()
  Contract:
  - Deterministic
  - One-to-one mapping
  - Immutable output
  - Entire 128-bit UUID encoded
  - No randomness
  - URL safe (Crockford Base32)
  - Case insensitive
  - Never change algorithm (Treat as permanent contract)
*/
CREATE OR REPLACE FUNCTION public.uuid_to_public_id(input_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path = ''
AS $$
DECLARE
    bytes BYTEA := uuid_send(input_uuid);
    res TEXT := '';
    chars TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    n NUMERIC := 0;
    i INTEGER;
BEGIN
    IF input_uuid IS NULL THEN
        RETURN NULL;
    END IF;

    FOR i IN 0..15 LOOP
        n := n * 256 + get_byte(bytes, i);
    END LOOP;
    
    IF n = 0 THEN
        RETURN lpad('0', 26, '0');
    END IF;
    
    WHILE n > 0 LOOP
        res := substr(chars, (n % 32)::integer + 1, 1) || res;
        n := floor(n / 32);
    END LOOP;
    
    RETURN lpad(res, 26, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_public_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.id IS NULL THEN
        NEW.id := gen_random_uuid();
    END IF;
    
    IF NEW.public_id IS NULL THEN
        NEW.public_id := public.uuid_to_public_id(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_prevent_public_id_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF OLD.public_id IS NOT NULL AND NEW.public_id IS DISTINCT FROM OLD.public_id THEN
        RAISE EXCEPTION 'public_id is immutable and cannot be updated';
    END IF;
    RETURN NEW;
END;
$$;
