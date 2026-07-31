-- Migration: IAM Policies, Triggers, and RLS

-- 1. Authorization Helper Functions
-- These functions provide a centralized, secure way to check roles and ownership
-- without embedding complex logic directly into RLS policies.

CREATE OR REPLACE FUNCTION public.is_host()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'host'::user_role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'::user_role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_listing_owner(listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT host_id = auth.uid() 
    FROM public.listings 
    WHERE id = listing_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Auth Profile Trigger
-- Creates a single identity record when a new user signs up.
-- Fields like full_name and avatar_url are seeded once from metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    'guest'::user_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. RLS Policies

--------------------------------------------------------------------------------
-- Profiles
--------------------------------------------------------------------------------
-- SELECT: Users can read their own profile (and admins can read all)
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- UPDATE: Users can update their own profile, but NOT id, role, or created_at
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());
  
-- Note: Column-level privileges could restrict updates to id, role, and created_at.
-- Alternatively, we can use a BEFORE UPDATE trigger to prevent modification of these fields:
CREATE OR REPLACE FUNCTION public.protect_identity_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of core identity fields by non-admins
  IF NOT public.is_admin() THEN
    NEW.id = OLD.id;
    NEW.role = OLD.role;
    NEW.created_at = OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_profile_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_identity_fields();

-- No INSERT or DELETE for profiles; managed by trigger.

--------------------------------------------------------------------------------
-- Listings
--------------------------------------------------------------------------------
-- SELECT: Everyone can read published listings. Hosts can read their own. Admins can read all.
CREATE POLICY "Public can read published listings" ON public.listings
  FOR SELECT USING (status = 'published'::listing_status OR host_id = auth.uid() OR public.is_admin());

-- INSERT: Only hosts (and admins) can create listings
CREATE POLICY "Hosts can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (public.is_host() OR public.is_admin()) AND
    host_id = auth.uid() -- must insert as themselves
  );

-- UPDATE: Hosts can update their own listings
CREATE POLICY "Hosts can update own listings" ON public.listings
  FOR UPDATE USING (host_id = auth.uid() OR public.is_admin());

-- DELETE: Hosts can delete their own listings
CREATE POLICY "Hosts can delete own listings" ON public.listings
  FOR DELETE USING (host_id = auth.uid() OR public.is_admin());

--------------------------------------------------------------------------------
-- Bookings
--------------------------------------------------------------------------------
-- SELECT: Guests can read their own bookings. Hosts can read bookings for their listings.
CREATE POLICY "Guests can view own bookings" ON public.bookings
  FOR SELECT USING (guest_id = auth.uid() OR public.is_admin());

CREATE POLICY "Hosts can view bookings for their listings" ON public.bookings
  FOR SELECT USING (public.is_listing_owner(listing_id) OR public.is_admin());

-- INSERT: Any authenticated user can create a booking for themselves (guests/hosts acting as guests)
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    guest_id = auth.uid()
  );

-- UPDATE (State Transitions):
-- Guests can cancel a booking (change status to 'cancelled') if it is 'pending'.
CREATE POLICY "Guests can cancel pending bookings" ON public.bookings
  FOR UPDATE USING (
    guest_id = auth.uid() AND 
    status = 'pending'::booking_status
  ) WITH CHECK (
    guest_id = auth.uid() AND 
    status = 'cancelled'::booking_status
  );

-- Hosts can approve/reject pending bookings
CREATE POLICY "Hosts can approve/reject pending bookings" ON public.bookings
  FOR UPDATE USING (
    public.is_listing_owner(listing_id) AND status = 'pending'::booking_status
  ) WITH CHECK (
    public.is_listing_owner(listing_id) AND status IN ('confirmed'::booking_status, 'cancelled'::booking_status)
  );

-- Hosts can transition confirmed bookings to checked_in or refunded
CREATE POLICY "Hosts can transition confirmed bookings" ON public.bookings
  FOR UPDATE USING (
    public.is_listing_owner(listing_id) AND status = 'confirmed'::booking_status
  ) WITH CHECK (
    public.is_listing_owner(listing_id) AND status IN ('checked_in'::booking_status, 'refunded'::booking_status)
  );

-- Hosts can transition checked_in bookings to checked_out
CREATE POLICY "Hosts can check out bookings" ON public.bookings
  FOR UPDATE USING (
    public.is_listing_owner(listing_id) AND status = 'checked_in'::booking_status
  ) WITH CHECK (
    public.is_listing_owner(listing_id) AND status = 'checked_out'::booking_status
  );

-- Admins can update anything
CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (public.is_admin());

-- DELETE: Only admins can delete bookings (soft delete or status change is preferred for others)
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (public.is_admin());
