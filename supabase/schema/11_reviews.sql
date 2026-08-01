/*
==================================================
Domain: Reviews
Purpose: Guest and host feedback.
Contains: 
- reviews
- triggers
- RLS
==================================================
*/

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    stay_id UUID REFERENCES public.stays(id) ON DELETE CASCADE NOT NULL UNIQUE,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    host_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER reviews_updated_at 
  BEFORE UPDATE ON public.reviews 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for their stays" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    guest_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.stays s 
        WHERE s.id = reviews.stay_id 
        AND s.guest_id = auth.uid()
        AND s.status IN ('completed'::public.stay_status, 'checked_out'::public.stay_status)
    )
  );

CREATE POLICY "Guests can update own reviews" ON public.reviews
  FOR UPDATE USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Guests can delete own reviews" ON public.reviews
  FOR DELETE USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can respond to reviews" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = reviews.listing_id 
        AND l.host_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL USING (public.is_admin());
