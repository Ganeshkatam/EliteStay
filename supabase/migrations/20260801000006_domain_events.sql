-- Phase B: Domain Authorization - Event Logging

CREATE TABLE public.booking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status public.booking_status,
  new_status public.booking_status,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.stay_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stay_id uuid NOT NULL REFERENCES public.stays(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status public.stay_status,
  new_status public.stay_status,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Indexes for performance
CREATE INDEX booking_events_booking_id_idx ON public.booking_events(booking_id);
CREATE INDEX stay_events_stay_id_idx ON public.stay_events(stay_id);

-- Enable RLS
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_events ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
CREATE POLICY "Users can view events for their bookings"
ON public.booking_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_events.booking_id
    AND (b.guest_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = b.listing_id AND l.host_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can view events for their stays"
ON public.stay_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stays s
    WHERE s.id = stay_events.stay_id
    AND (s.guest_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = s.listing_id AND l.host_id = auth.uid()
    ))
  )
);

-- INSERT Policies (Users can only insert events for themselves)
CREATE POLICY "Users can insert events for their bookings"
ON public.booking_events FOR INSERT
WITH CHECK (
  actor_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_events.booking_id
    AND (b.guest_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = b.listing_id AND l.host_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can insert events for their stays"
ON public.stay_events FOR INSERT
WITH CHECK (
  actor_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.stays s
    WHERE s.id = stay_events.stay_id
    AND (s.guest_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = s.listing_id AND l.host_id = auth.uid()
    ))
  )
);

-- No UPDATE or DELETE policies -> Immutable events
