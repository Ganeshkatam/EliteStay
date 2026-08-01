-- Allow authenticated users to read the cache
CREATE POLICY "Enable read access for authenticated users"
ON public.geocoding_cache FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert/update the cache
CREATE POLICY "Enable insert access for authenticated users"
ON public.geocoding_cache FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON public.geocoding_cache FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
