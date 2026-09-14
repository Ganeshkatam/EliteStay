/*
==================================================
Domain: Stays
Purpose: Tenancy management, active residences, and check-in/check-out lifecycle.
Contains: 
- stays
- stay_events
- transition_stay atomic RPC
- triggers, RLS, & composite indexes
==================================================
*/

CREATE TABLE public.stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    created_from_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expected_move_in_date DATE NOT NULL,
    actual_move_in_date DATE,
    expected_move_out_date DATE NOT NULL,
    actual_move_out_date DATE,
    agreed_amount NUMERIC(12, 2) NOT NULL,
    agreed_billing_period public.billing_period NOT NULL,
    security_deposit_paid NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    status public.stay_status DEFAULT 'upcoming'::public.stay_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_stay_dates CHECK (expected_move_out_date > expected_move_in_date)
);

CREATE INDEX IF NOT EXISTS idx_stays_created_from_booking_id ON public.stays(created_from_booking_id);
CREATE INDEX IF NOT EXISTS idx_stays_guest_status ON public.stays(guest_id, status);
CREATE INDEX IF NOT EXISTS idx_stays_listing_status ON public.stays(listing_id, status);

CREATE TABLE public.stay_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID NOT NULL REFERENCES public.stays(id) ON DELETE RESTRICT,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    previous_status public.stay_status,
    new_status public.stay_status,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stay_events_stay_id ON public.stay_events(stay_id);

CREATE TRIGGER stays_updated_at 
  BEFORE UPDATE ON public.stays 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own stays" ON public.stays
  FOR SELECT USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can view stays for their listings" ON public.stays
  FOR SELECT USING (public.is_listing_owner(listing_id) OR public.is_admin());

CREATE POLICY "Hosts can manage stays" ON public.stays
  FOR ALL USING (public.is_listing_owner(listing_id) OR public.is_admin());

-- Stay Events RLS Policies
CREATE POLICY "Users can view events for their stays" ON public.stay_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id = stay_events.stay_id
      AND (s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert events for their stays" ON public.stay_events
  FOR INSERT WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id = stay_events.stay_id
      AND (s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR public.is_admin())
    )
  );

-- Atomic stay transition RPC
CREATE OR REPLACE FUNCTION public.transition_stay(
  p_stay_id uuid,
  p_current_status public.stay_status,
  p_new_status public.stay_status,
  p_actor_id uuid,
  p_updates jsonb DEFAULT '{}'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay public.stays%ROWTYPE;
BEGIN
  -- Lock row against concurrent transitions
  SELECT * INTO v_stay
  FROM public.stays
  WHERE id = p_stay_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stay not found';
  END IF;

  IF v_stay.status != p_current_status THEN
    RAISE EXCEPTION 'Stay state changed by another process (expected %, got %)', p_current_status, v_stay.status;
  END IF;

  -- Apply status transition and date updates
  UPDATE public.stays
  SET 
    status = p_new_status,
    actual_move_in_date = COALESCE((p_updates->>'actual_move_in_date')::date, actual_move_in_date),
    actual_move_out_date = COALESCE((p_updates->>'actual_move_out_date')::date, actual_move_out_date)
  WHERE id = p_stay_id;

  -- Insert domain event log
  INSERT INTO public.stay_events (
    stay_id,
    action,
    actor_id,
    previous_status,
    new_status,
    metadata
  ) VALUES (
    p_stay_id,
    p_new_status::text,
    p_actor_id,
    p_current_status,
    p_new_status,
    p_metadata
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Stays Lock Trigger
CREATE OR REPLACE FUNCTION public.lock_parent_listing_for_stay()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.listing_id IS DISTINCT FROM NEW.listing_id THEN
      PERFORM public.acquire_listing_locks_ordered(OLD.listing_id, NEW.listing_id);
    ELSIF NEW.status IN ('upcoming', 'active', 'extended') AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_parent_listing_for_stay ON public.stays;
CREATE TRIGGER trg_lock_parent_listing_for_stay
  BEFORE INSERT OR UPDATE ON public.stays
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_parent_listing_for_stay();

ALTER FUNCTION public.lock_parent_listing_for_stay() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.lock_parent_listing_for_stay() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lock_parent_listing_for_stay() TO postgres, authenticated;

