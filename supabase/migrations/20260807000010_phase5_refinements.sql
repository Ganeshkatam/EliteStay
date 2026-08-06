-- Phase 5 Refinements: Lease Versioning, Move-In Checklist Expansion, and New Domain Events

-- ============================================================
-- 1. Lease Versions Table
-- ============================================================
-- Lease records are immutable snapshots. When a lease is renewed or amended,
-- a new version is created rather than mutating the original record.

CREATE TABLE public.lease_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE RESTRICT NOT NULL,

  version_number INTEGER NOT NULL DEFAULT 1,

  -- Snapshot of the lease terms at this version
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent_amount DECIMAL(10,2) NOT NULL,
  security_deposit_amount DECIMAL(10,2) NOT NULL,
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Who created this version and why
  change_reason TEXT, -- e.g. 'INITIAL', 'RENEWAL', 'AMENDMENT'
  created_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(lease_id, version_number)
);

ALTER TABLE public.lease_versions ENABLE ROW LEVEL SECURITY;

-- Tenants can read versions of their own leases
CREATE POLICY "Tenants can view own lease versions" ON public.lease_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      WHERE l.id = public.lease_versions.lease_id
      AND l.tenant_id = auth.uid()
    )
  );

-- Hosts can read versions for their properties
CREATE POLICY "Hosts can view lease versions for their properties" ON public.lease_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.lease_versions.lease_id
      AND ls.host_id = auth.uid()
    )
  );

-- Hosts can insert new versions for their properties
CREATE POLICY "Hosts can insert lease versions" ON public.lease_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.lease_versions.lease_id
      AND ls.host_id = auth.uid()
    )
  );

-- Track the current active version on the lease itself
ALTER TABLE public.leases
ADD COLUMN current_version_id UUID REFERENCES public.lease_versions(id);

-- ============================================================
-- 2. Expand Move-In Checklist
-- ============================================================
-- Add the three additional move-in steps identified in the review.

ALTER TABLE public.move_ins
ADD COLUMN inventory_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN utility_information_shared BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN emergency_contacts_confirmed BOOLEAN NOT NULL DEFAULT false;
