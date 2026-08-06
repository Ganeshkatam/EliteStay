-- Phase 4.6: Viewing Requests

CREATE TYPE public.viewing_request_status AS ENUM (
  'REQUESTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE public.viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL REFERENCES public.listings(public_id),
  guest_id UUID NOT NULL REFERENCES auth.users(id),
  status public.viewing_request_status NOT NULL DEFAULT 'REQUESTED',
  
  requested_date DATE NOT NULL,
  requested_time TEXT NOT NULL,
  message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

-- Policies for viewing_requests
CREATE POLICY "Guests can manage their own viewing requests" ON public.viewing_requests FOR ALL USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can see viewing requests" ON public.viewing_requests FOR SELECT USING (
  property_id IN (
    SELECT public_id FROM public.listings WHERE host_id = auth.uid()
  )
);

CREATE POLICY "Hosts can update viewing requests" ON public.viewing_requests FOR UPDATE USING (
  property_id IN (
    SELECT public_id FROM public.listings WHERE host_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER viewing_requests_updated_at
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
