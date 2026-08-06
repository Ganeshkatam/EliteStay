-- Phase 5.1: Lease Aggregate

CREATE TYPE public.lease_status AS ENUM (
  'DRAFT',
  'GENERATED',
  'ISSUED',
  'SIGNED',
  'ACTIVE',
  'RENEWED',
  'EXPIRED',
  'TERMINATED'
);

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- A lease fundamentally belongs to an approved/confirmed reservation
  reservation_id UUID REFERENCES public.bookings(id) ON DELETE RESTRICT NOT NULL UNIQUE,
  
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  
  status public.lease_status NOT NULL DEFAULT 'DRAFT',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent_amount DECIMAL(10,2) NOT NULL,
  security_deposit_amount DECIMAL(10,2) NOT NULL,
  
  -- The source of truth for all lease terms and conditions
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Immutable archived PDF version
  document_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

-- Tenants can read their own leases
CREATE POLICY "Tenants can view own leases" ON public.leases
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- Hosts can read leases for their properties
-- Requires joining through bookings and listings
CREATE POLICY "Hosts can view leases for their properties" ON public.leases
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = public.leases.reservation_id
      AND l.host_id = auth.uid()
    )
  );

-- Only backend services (or hosts via RPCs) should create/update leases,
-- but for simplicity, allow authenticated users to interact if they pass RLS,
-- or restrict to server actions via specific policies.
-- In a real app with strict no-service-role, server actions run as the host.
CREATE POLICY "Hosts can update leases for their properties" ON public.leases
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = public.leases.reservation_id
      AND l.host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can insert leases for their properties" ON public.leases
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON b.listing_id = l.id
      WHERE b.id = public.leases.reservation_id
      AND l.host_id = auth.uid()
    )
  );
