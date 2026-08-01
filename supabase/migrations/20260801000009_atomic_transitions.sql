-- Phase C: Atomic Transitions

-- Atomic booking transition
CREATE OR REPLACE FUNCTION transition_booking(
  p_booking_id uuid,
  p_current_status public.booking_status,
  p_new_status public.booking_status,
  p_actor_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- Lock the row
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status != p_current_status THEN
    RAISE EXCEPTION 'Booking state changed by another process (expected %, got %)', p_current_status, v_booking.status;
  END IF;

  -- Update status
  UPDATE public.bookings
  SET status = p_new_status
  WHERE id = p_booking_id;

  -- Insert event
  INSERT INTO public.booking_events (
    booking_id,
    action,
    actor_id,
    previous_status,
    new_status,
    metadata
  ) VALUES (
    p_booking_id,
    p_new_status::text,
    p_actor_id,
    p_current_status,
    p_new_status,
    p_metadata
  );

  RETURN jsonb_build_object('success', true);
END;
$$;


-- Atomic stay transition
CREATE OR REPLACE FUNCTION transition_stay(
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
  -- Lock the row
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

  -- Update status and any additional fields passed in updates
  UPDATE public.stays
  SET 
    status = p_new_status,
    actual_move_in_date = COALESCE((p_updates->>'actual_move_in_date')::date, actual_move_in_date),
    actual_move_out_date = COALESCE((p_updates->>'actual_move_out_date')::date, actual_move_out_date)
  WHERE id = p_stay_id;

  -- Insert event
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
