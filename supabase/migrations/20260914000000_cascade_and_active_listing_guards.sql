-- Migration: 20260914000000_cascade_and_active_listing_guards.sql
-- Description: EliteStay Approved Database Cascading, Dual-Graph Audits & Tenancy Deletion Guards
-- Project: ybeidsnuijipacnmybfo (ap-south-1)
-- PostgreSQL: 17.x

BEGIN;

-- ==============================================================================
-- STAGE 1: FOREIGN KEY NORMALIZATION (FAIL-CLOSED DYNAMIC DISCOVERY)
-- ==============================================================================
DO $$
DECLARE
  v_conname text;
  v_match_count integer;
BEGIN
  -- 1. viewing_requests(property_id) -> listings(public_id) ON DELETE CASCADE
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.viewing_requests'::regclass
    AND confrelid = 'public.listings'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: viewing_requests -> listings count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.viewing_requests DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.viewing_requests ADD CONSTRAINT viewing_requests_property_id_fkey 
    FOREIGN KEY (property_id) REFERENCES public.listings(public_id) ON DELETE CASCADE;

  -- 2. rental_applications(property_id) -> listings(id) ON DELETE CASCADE
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.rental_applications'::regclass
    AND confrelid = 'public.listings'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: rental_applications -> listings count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.rental_applications DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.rental_applications ADD CONSTRAINT rental_applications_property_id_fkey 
    FOREIGN KEY (property_id) REFERENCES public.listings(id) ON DELETE CASCADE;

  -- 3. applicant_profiles(guest_id) -> auth.users(id) ON DELETE SET NULL
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.applicant_profiles'::regclass
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: applicant_profiles -> auth.users count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.applicant_profiles DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.applicant_profiles ALTER COLUMN guest_id DROP NOT NULL;
  ALTER TABLE public.applicant_profiles ADD CONSTRAINT applicant_profiles_guest_id_fkey 
    FOREIGN KEY (guest_id) REFERENCES auth.users(id) ON DELETE SET NULL;

  -- 4. stays(listing_id) -> listings(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.stays'::regclass
    AND confrelid = 'public.listings'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: stays -> listings count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.stays DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.stays ADD CONSTRAINT stays_listing_id_fkey 
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE RESTRICT;

  -- 5. stays(guest_id) -> profiles(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.stays'::regclass
    AND confrelid = 'public.profiles'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: stays -> profiles count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.stays DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.stays ADD CONSTRAINT stays_guest_id_fkey 
    FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

  -- 6. reviews(listing_id) -> listings(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.reviews'::regclass
    AND confrelid = 'public.listings'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: reviews -> listings count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.reviews DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.reviews ADD CONSTRAINT reviews_listing_id_fkey 
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE RESTRICT;

  -- 7. reviews(stay_id) -> stays(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.reviews'::regclass
    AND confrelid = 'public.stays'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: reviews -> stays count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.reviews DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.reviews ADD CONSTRAINT reviews_stay_id_fkey 
    FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE RESTRICT;

  -- 8. reviews(guest_id) -> profiles(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.reviews'::regclass
    AND confrelid = 'public.profiles'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: reviews -> profiles count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.reviews DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.reviews ADD CONSTRAINT reviews_guest_id_fkey 
    FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

  -- 9. accounts(lease_id) -> leases(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.accounts'::regclass
    AND confrelid = 'public.leases'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: accounts -> leases count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.accounts DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.accounts ADD CONSTRAINT accounts_lease_id_fkey 
    FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE RESTRICT;

  -- 10. invoices(lease_id) -> leases(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.invoices'::regclass
    AND confrelid = 'public.leases'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: invoices -> leases count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.invoices DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.invoices ADD CONSTRAINT invoices_lease_id_fkey 
    FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE RESTRICT;

  -- 11. charge_schedules(lease_id) -> leases(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.charge_schedules'::regclass
    AND confrelid = 'public.leases'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: charge_schedules -> leases count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.charge_schedules DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.charge_schedules ADD CONSTRAINT charge_schedules_lease_id_fkey 
    FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE RESTRICT;

  -- 12. resident_notices(lease_id) -> leases(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.resident_notices'::regclass
    AND confrelid = 'public.leases'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: resident_notices -> leases count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.resident_notices DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.resident_notices ADD CONSTRAINT resident_notices_lease_id_fkey 
    FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE RESTRICT;

  -- 13. maintenance_requests(lease_id) -> leases(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.maintenance_requests'::regclass
    AND confrelid = 'public.leases'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: maintenance_requests -> leases count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.maintenance_requests DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT maintenance_requests_lease_id_fkey 
    FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE RESTRICT;

  -- 14. stay_events(stay_id) -> stays(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.stay_events'::regclass
    AND confrelid = 'public.stays'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: stay_events -> stays count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.stay_events DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.stay_events ADD CONSTRAINT stay_events_stay_id_fkey 
    FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE RESTRICT;

  -- 15. conversations(stay_id) -> stays(id) ON DELETE SET NULL
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.conversations'::regclass
    AND confrelid = 'public.stays'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: conversations -> stays count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.conversations DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.conversations ADD CONSTRAINT conversations_stay_id_fkey 
    FOREIGN KEY (stay_id) REFERENCES public.stays(id) ON DELETE SET NULL;

  -- 16. ledger_entries(account_id) -> accounts(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.ledger_entries'::regclass
    AND confrelid = 'public.accounts'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: ledger_entries -> accounts count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.ledger_entries DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.ledger_entries ADD CONSTRAINT ledger_entries_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;

  -- 17. payment_allocations(payment_entry_id) -> ledger_entries(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.payment_allocations'::regclass
    AND confrelid = 'public.ledger_entries'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: payment_allocations -> ledger_entries count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.payment_allocations DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.payment_allocations ADD CONSTRAINT payment_allocations_payment_entry_id_fkey 
    FOREIGN KEY (payment_entry_id) REFERENCES public.ledger_entries(id) ON DELETE RESTRICT;

  -- 18. payment_allocations(invoice_id) -> invoices(id) ON DELETE RESTRICT
  SELECT count(*), min(conname) INTO v_match_count, v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.payment_allocations'::regclass
    AND confrelid = 'public.invoices'::regclass
    AND contype = 'f';
  IF v_match_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: payment_allocations -> invoices count %', v_match_count;
  END IF;
  EXECUTE format('ALTER TABLE public.payment_allocations DROP CONSTRAINT %I', v_conname);
  ALTER TABLE public.payment_allocations ADD CONSTRAINT payment_allocations_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE RESTRICT;

END $$;

-- ==============================================================================
-- STAGE 2: DELETION GUARDS (LISTING & USER)
-- ==============================================================================

-- 1. Listing Deletion Guard
CREATE OR REPLACE FUNCTION public.prevent_protected_listing_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Priority 1: Active legal leases
  IF EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.bookings b ON b.id = l.reservation_id
    WHERE b.listing_id = OLD.id AND l.status IN ('PENDING_SIGNATURE', 'ACTIVE')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active legal lease contract is currently in effect. Active leases must be formally terminated or expired before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 2: Active resident stays
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE listing_id = OLD.id AND status IN ('upcoming', 'active', 'extended')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active resident stay is currently in progress. Stays must be checked out or completed before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 3: Active booking reservations
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE listing_id = OLD.id AND status IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: an active booking reservation exists. Active bookings must be completed, rejected, or cancelled before deleting.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 4: Any historical lease reference
  IF EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.bookings b ON b.id = l.reservation_id
    WHERE b.listing_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: this property has been referenced by a legal lease contract. To retire this property, update status to ''archived'' to preserve statutory financial and tenancy audit history.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Priority 5: Any stay record (unconditional residency history)
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE listing_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete listing %: this property has resident stay history. Archive the listing instead.', 
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_listing_deletion ON public.listings;
DROP TRIGGER IF EXISTS trg_prevent_active_listing_deletion ON public.listings;
CREATE TRIGGER trg_prevent_protected_listing_deletion
  BEFORE DELETE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_protected_listing_deletion();

-- 2. User Privacy Anonymization Trigger
CREATE OR REPLACE FUNCTION public.anonymize_user_applicant_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.applicant_profiles WHERE guest_id = OLD.id) THEN
    UPDATE public.applicant_profiles
    SET 
      employment_status = 'ANONYMIZED',
      student_status = 'ANONYMIZED',
      income_range = 'ANONYMIZED',
      pet_information = NULL,
      guarantor_information = NULL,
      smoking_preference = NULL,
      updated_at = NOW()
    WHERE guest_id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_anonymize_user_applicant_profile ON auth.users;
CREATE TRIGGER trg_anonymize_user_applicant_profile
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_user_applicant_profile();

-- 3. User Deletion Guard (Symmetric Tenant & Host Protection)
CREATE OR REPLACE FUNCTION public.prevent_protected_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Tenant Check 1: Active or historical lease contract
  IF EXISTS (
    SELECT 1 FROM public.leases
    WHERE tenant_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has active or historical lease contracts on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 2: Active or historical resident stay
  IF EXISTS (
    SELECT 1 FROM public.stays
    WHERE guest_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has active or historical resident stay records on file.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Tenant Check 3: Financial accounts
  IF EXISTS (
    SELECT 1 FROM public.accounts
    WHERE tenant_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete user account %: user has financial ledger accounts on record.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 1: Any property referenced by a lease
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.bookings b ON b.listing_id = l.id
    JOIN public.leases le ON le.reservation_id = b.id
    WHERE l.host_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties referenced by legal lease contracts. Properties must be archived, not deleted.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 2: Any property referenced by a stay
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.stays s ON s.listing_id = l.id
    WHERE l.host_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties with resident stay records on file. Properties must be archived, not deleted.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  -- Host Check 3: Active bookings
  IF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.bookings b ON b.listing_id = l.id
    WHERE l.host_id = OLD.id AND b.status IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Cannot delete host account %: user owns properties with active booking reservations.',
      OLD.id
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_user_deletion ON auth.users;
DROP TRIGGER IF EXISTS trg_prevent_active_user_deletion ON auth.users;
CREATE TRIGGER trg_prevent_protected_user_deletion
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_protected_user_deletion();

-- Privilege Hardening
ALTER FUNCTION public.prevent_protected_listing_deletion() OWNER TO postgres;
ALTER FUNCTION public.prevent_protected_user_deletion() OWNER TO postgres;
ALTER FUNCTION public.anonymize_user_applicant_profile() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.prevent_protected_listing_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_protected_user_deletion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anonymize_user_applicant_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_protected_listing_deletion() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_protected_user_deletion() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_user_applicant_profile() TO postgres, authenticated;

-- ==============================================================================
-- STAGE 3: TARGETED CONCURRENCY LOCKS & HIERARCHICAL ROW ORDERING
-- ==============================================================================

-- Explicit Deterministic Dual Listing Locker
CREATE OR REPLACE FUNCTION public.acquire_listing_locks_ordered(
  p_listing_a uuid,
  p_listing_b uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first uuid;
  v_second uuid;
BEGIN
  IF p_listing_a IS NULL AND p_listing_b IS NULL THEN
    RETURN;
  ELSIF p_listing_a IS NULL THEN
    PERFORM 1 FROM public.listings WHERE id = p_listing_b FOR UPDATE;
    RETURN;
  ELSIF p_listing_b IS NULL OR p_listing_a = p_listing_b THEN
    PERFORM 1 FROM public.listings WHERE id = p_listing_a FOR UPDATE;
    RETURN;
  END IF;

  v_first := LEAST(p_listing_a, p_listing_b);
  v_second := GREATEST(p_listing_a, p_listing_b);

  PERFORM 1 FROM public.listings WHERE id = v_first FOR UPDATE;
  PERFORM 1 FROM public.listings WHERE id = v_second FOR UPDATE;
END;
$$;

-- 1. Bookings Lock Trigger
CREATE OR REPLACE FUNCTION public.lock_parent_listing_for_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.listing_id IS DISTINCT FROM NEW.listing_id THEN
      PERFORM public.acquire_listing_locks_ordered(OLD.listing_id, NEW.listing_id);
    ELSIF NEW.status IN ('pending', 'approved') AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('pending', 'approved') THEN
      PERFORM 1 FROM public.listings WHERE id = NEW.listing_id FOR UPDATE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_parent_listing_for_booking ON public.bookings;
CREATE TRIGGER trg_lock_parent_listing_for_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_parent_listing_for_booking();

-- 2. Stays Lock Trigger
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

-- 3. Leases Lock Trigger (Hierarchical: Parent Booking Locked First, Then Listing)
CREATE OR REPLACE FUNCTION public.lock_parent_listing_for_lease()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_listing_id uuid;
  v_new_listing_id uuid;
  v_first_booking uuid;
  v_second_booking uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.reservation_id IS DISTINCT FROM NEW.reservation_id THEN
      -- Step 1: Lock booking rows in deterministic order
      v_first_booking := LEAST(OLD.reservation_id, NEW.reservation_id);
      v_second_booking := GREATEST(OLD.reservation_id, NEW.reservation_id);
      PERFORM 1 FROM public.bookings WHERE id = v_first_booking FOR UPDATE;
      PERFORM 1 FROM public.bookings WHERE id = v_second_booking FOR UPDATE;

      -- Step 2: Retrieve parent listing IDs
      SELECT listing_id INTO v_old_listing_id FROM public.bookings WHERE id = OLD.reservation_id;
      SELECT listing_id INTO v_new_listing_id FROM public.bookings WHERE id = NEW.reservation_id;

      -- Step 3: Lock parent listings in deterministic order
      PERFORM public.acquire_listing_locks_ordered(v_old_listing_id, v_new_listing_id);
    ELSIF NEW.status IN ('PENDING_SIGNATURE', 'ACTIVE') AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM 1 FROM public.bookings WHERE id = NEW.reservation_id FOR UPDATE;
      SELECT listing_id INTO v_new_listing_id FROM public.bookings WHERE id = NEW.reservation_id;
      IF v_new_listing_id IS NOT NULL THEN
        PERFORM 1 FROM public.listings WHERE id = v_new_listing_id FOR UPDATE;
      END IF;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM 1 FROM public.bookings WHERE id = NEW.reservation_id FOR UPDATE;
    SELECT listing_id INTO v_new_listing_id FROM public.bookings WHERE id = NEW.reservation_id;
    IF v_new_listing_id IS NOT NULL THEN
      PERFORM 1 FROM public.listings WHERE id = v_new_listing_id FOR UPDATE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_parent_listing_for_lease ON public.leases;
CREATE TRIGGER trg_lock_parent_listing_for_lease
  BEFORE INSERT OR UPDATE ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_parent_listing_for_lease();

CREATE OR REPLACE FUNCTION public.ordered_dual_listing_locker(p_listing_a uuid, p_listing_b uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.acquire_listing_locks_ordered(p_listing_a, p_listing_b);
END;
$$;

ALTER FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) OWNER TO postgres;
ALTER FUNCTION public.ordered_dual_listing_locker(uuid, uuid) OWNER TO postgres;
ALTER FUNCTION public.lock_parent_listing_for_booking() OWNER TO postgres;
ALTER FUNCTION public.lock_parent_listing_for_stay() OWNER TO postgres;
ALTER FUNCTION public.lock_parent_listing_for_lease() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ordered_dual_listing_locker(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lock_parent_listing_for_booking() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lock_parent_listing_for_stay() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lock_parent_listing_for_lease() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acquire_listing_locks_ordered(uuid, uuid) TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.ordered_dual_listing_locker(uuid, uuid) TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.lock_parent_listing_for_booking() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.lock_parent_listing_for_stay() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION public.lock_parent_listing_for_lease() TO postgres, authenticated;

-- ==============================================================================
-- STAGE 4: POST-MIGRATION DUAL-GRAPH AUDITS (AUDITS A & B)
-- ==============================================================================
DO $$
DECLARE
  v_violating_paths text;
  v_protected_oids oid[] := ARRAY[
    'public.leases'::regclass::oid,
    'public.lease_versions'::regclass::oid,
    'public.stays'::regclass::oid,
    'public.reviews'::regclass::oid,
    'public.security_deposits'::regclass::oid,
    'public.move_ins'::regclass::oid,
    'public.invoices'::regclass::oid,
    'public.accounts'::regclass::oid,
    'public.ledger_entries'::regclass::oid,
    'public.payment_allocations'::regclass::oid
  ];
BEGIN
  -- ----------------------------------------------------------------------------
  -- Audit A: CASCADE Closure from auth.users and public.listings
  -- ----------------------------------------------------------------------------
  WITH RECURSIVE cascade_graph AS (
    SELECT 
      conrelid AS child_oid,
      confrelid AS parent_oid,
      conname::text AS constraint_name,
      1 AS depth,
      ARRAY[confrelid::regclass::text, conrelid::regclass::text] AS path
    FROM pg_constraint
    WHERE confrelid IN ('auth.users'::regclass::oid, 'public.listings'::regclass::oid) 
      AND confdeltype = 'c'
    
    UNION ALL
    
    SELECT 
      c.conrelid AS child_oid,
      c.confrelid AS parent_oid,
      c.conname::text AS constraint_name,
      cg.depth + 1,
      cg.path || c.conrelid::regclass::text
    FROM pg_constraint c
    JOIN cascade_graph cg ON c.confrelid = cg.child_oid
    WHERE c.confdeltype = 'c'
      AND NOT (c.conrelid::regclass::text = ANY(cg.path))
  )
  SELECT string_agg('Path: ' || array_to_string(path, ' -> '), E'\n') INTO v_violating_paths
  FROM cascade_graph
  WHERE child_oid = ANY(v_protected_oids);

  IF v_violating_paths IS NOT NULL THEN
    RAISE EXCEPTION E'AUDIT A FAILED: Transitive CASCADE path reaches Tier 3 protected entity:\n%', v_violating_paths;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Audit B: Protected Reference Audit
  -- Every FK whose referenced table belongs to the canonical Tier-3 set MUST use one of:
  -- RESTRICT, NO ACTION, or SET NULL.
  -- confdeltype = 'c' (CASCADE) is strictly prohibited.
  -- ----------------------------------------------------------------------------
  SELECT string_agg(conrelid::regclass::text || ' -> ' || confrelid::regclass::text || ' (' || conname || ')', E'\n')
  INTO v_violating_paths
  FROM pg_constraint
  WHERE confrelid = ANY(v_protected_oids)
    AND confdeltype = 'c';

  IF v_violating_paths IS NOT NULL THEN
    RAISE EXCEPTION E'AUDIT B FAILED: CASCADE constraint pointing to Tier 3 protected entity detected:\n%', v_violating_paths;
  END IF;
END $$;

COMMIT;
