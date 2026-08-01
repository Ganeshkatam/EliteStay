-- 20260801000007_account_deletion.sql
-- Enables cascading deletions for all user-related entities so account deletion succeeds cleanly without breaking check constraints.

-- 1. Update listings constraint
ALTER TABLE public.listings 
  DROP CONSTRAINT IF EXISTS listings_host_id_fkey,
  ADD CONSTRAINT listings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Update bookings constraints
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_guest_id_fkey,
  ADD CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS bookings_listing_id_fkey,
  ADD CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

-- 3. Update stays constraints
ALTER TABLE public.stays
  DROP CONSTRAINT IF EXISTS stays_guest_id_fkey,
  ADD CONSTRAINT stays_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS stays_listing_id_fkey,
  ADD CONSTRAINT stays_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

-- 4. Update reviews constraints
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_guest_id_fkey,
  ADD CONSTRAINT reviews_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS reviews_listing_id_fkey,
  ADD CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS reviews_stay_id_fkey,
  ADD CONSTRAINT reviews_stay_id_fkey FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE CASCADE;

-- 5. Update messages and conversations constraints
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_booking_id_fkey,
  ADD CONSTRAINT conversations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS conversations_stay_id_fkey,
  ADD CONSTRAINT conversations_stay_id_fkey FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE CASCADE;

-- 6. Create RPC for deleting the account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid;
BEGIN
  -- Get the current authenticated user ID
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from auth.users, which cascades to all related tables
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- 7. Trigger to automatically remove auth.users entry when a profile row is deleted manually
CREATE OR REPLACE FUNCTION public.handle_deleted_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deleted_profile();
