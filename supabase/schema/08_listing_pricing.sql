/*
==================================================
Domain: Listing Pricing
Purpose: Financial terms, pricing models, and duration constraints for listings.
Contains: 
- listing_prices
- triggers & RLS policies
==================================================
*/

CREATE TABLE public.listing_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'INR' NOT NULL CHECK (currency = 'INR'),
    billing_period public.billing_period NOT NULL,
    security_deposit NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    maintenance_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    maintenance_fee_period public.billing_period DEFAULT 'semester'::public.billing_period,
    minimum_duration INTEGER DEFAULT 1 NOT NULL,
    maximum_duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER listing_prices_updated_at 
  BEFORE UPDATE ON public.listing_prices 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.listing_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view listing prices" ON public.listing_prices
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own listing prices" ON public.listing_prices
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.listings l 
        WHERE l.id = listing_prices.listing_id 
        AND (l.host_id = auth.uid() OR public.is_admin())
    )
  );
