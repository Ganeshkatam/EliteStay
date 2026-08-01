-- Phase B: Review Authorization

DROP POLICY IF EXISTS "Users can manage their reviews" ON public.reviews;

-- Note: "Public can view reviews" already exists

-- 1. INSERT: Guests can leave reviews only for their completed/checked_out stays
CREATE POLICY "Guests can insert reviews" 
ON public.reviews FOR INSERT
WITH CHECK (
  guest_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.stays s
    WHERE s.id = reviews.stay_id
    AND s.guest_id = auth.uid()
    AND s.status IN ('completed', 'checked_out')
  )
);

-- 2. UPDATE: Guests can update their own reviews
CREATE POLICY "Guests can update their reviews"
ON public.reviews FOR UPDATE
USING (
  guest_id = auth.uid()
)
WITH CHECK (
  guest_id = auth.uid()
);

-- 3. DELETE: Guests can delete their own reviews
CREATE POLICY "Guests can delete their reviews"
ON public.reviews FOR DELETE
USING (
  guest_id = auth.uid()
);
