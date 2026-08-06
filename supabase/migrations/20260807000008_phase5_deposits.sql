-- Phase 5.4: Security Deposits

CREATE TYPE public.security_deposit_status AS ENUM (
  'PENDING',
  'COLLECTED',
  'HELD',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'FORFEITED'
);

CREATE TABLE public.security_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE RESTRICT NOT NULL UNIQUE,
  
  amount DECIMAL(10,2) NOT NULL,
  status public.security_deposit_status NOT NULL DEFAULT 'PENDING',
  
  collected_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  release_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER security_deposits_updated_at
  BEFORE UPDATE ON public.security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.security_deposits ENABLE ROW LEVEL SECURITY;

-- Tenants can read their own deposits (via lease)
CREATE POLICY "Tenants can view own security deposits" ON public.security_deposits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      WHERE l.id = public.security_deposits.lease_id
      AND l.tenant_id = auth.uid()
    )
  );

-- Hosts can read security deposits for their properties
CREATE POLICY "Hosts can view security deposits for their properties" ON public.security_deposits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.security_deposits.lease_id
      AND ls.host_id = auth.uid()
    )
  );

-- Server actions manage updates
CREATE POLICY "Hosts can update security deposits" ON public.security_deposits
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.security_deposits.lease_id
      AND ls.host_id = auth.uid()
    )
  );
  
CREATE POLICY "Hosts can insert security deposits" ON public.security_deposits
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.bookings b ON l.reservation_id = b.id
      JOIN public.listings ls ON b.listing_id = ls.id
      WHERE l.id = public.security_deposits.lease_id
      AND ls.host_id = auth.uid()
    )
  );
