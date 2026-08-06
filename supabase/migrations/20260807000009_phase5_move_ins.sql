-- Phase 5.5: Move-In Aggregate

CREATE TYPE public.move_in_status AS ENUM (
  'PENDING',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE public.move_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE RESTRICT NOT NULL UNIQUE,
  
  status public.move_in_status NOT NULL DEFAULT 'PENDING',
  
  scheduled_date DATE,
  
  deposit_verified BOOLEAN NOT NULL DEFAULT false,
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  keys_issued BOOLEAN NOT NULL DEFAULT false,
  condition_report_signed BOOLEAN NOT NULL DEFAULT false,
  
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER move_ins_updated_at
  BEFORE UPDATE ON public.move_ins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.move_ins ENABLE ROW LEVEL SECURITY;

-- Tenants can read their own move-ins
CREATE POLICY "Tenants can view own move-ins" ON public.move_ins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      WHERE l.id = public.move_ins.lease_id
      AND l.tenant_id = auth.uid()
    )
  );

-- Hosts can read move-ins for their properties
CREATE POLICY "Hosts can view move-ins for their properties" ON public.move_ins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.move_ins.lease_id
      AND ls.host_id = auth.uid()
    )
  );

-- Server actions manage updates
CREATE POLICY "Hosts can update move-ins" ON public.move_ins
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.move_ins.lease_id
      AND ls.host_id = auth.uid()
    )
  );
  
CREATE POLICY "Hosts can insert move-ins" ON public.move_ins
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.move_ins.lease_id
      AND ls.host_id = auth.uid()
    )
  );
