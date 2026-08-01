/*
==================================================
Domain: Reviews
Purpose: Guest ratings, property evaluations, and review verifications.
Contains: 
- reviews
- triggers, RLS, & listing index
==================================================
*/

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID REFERENCES public.stays(id) ON DELETE RESTRICT NOT NULL UNIQUE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (comment IS NULL OR char_length(comment) >= 10),
    host_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guest_id ON public.reviews(guest_id);

CREATE TRIGGER reviews_updated_at 
  BEFORE UPDATE ON public.reviews 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for their completed stays" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    guest_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.stays s
        WHERE s.id = reviews.stay_id 
        AND s.guest_id = auth.uid()
        AND s.status IN ('checked_out'::public.stay_status, 'completed'::public.stay_status)
    )
  );

CREATE POLICY "Hosts can reply to reviews on their listings" ON public.reviews
  FOR UPDATE USING (public.is_listing_owner(listing_id) OR public.is_admin())
  WITH CHECK (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE POLICY "Guests can update their own reviews" ON public.reviews
  FOR UPDATE USING (guest_id = auth.uid() OR public.is_admin())
  WITH CHECK (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin());
