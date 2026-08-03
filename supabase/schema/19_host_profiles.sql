/*
==================================================
Domain: Hosting Bounded Context & Host Profile Entity
Purpose: Permanent record for host entity business settings, verified facts, and capabilities without replacing guest roles.
==================================================
*/

CREATE TABLE IF NOT EXISTS public.host_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.host_status NOT NULL DEFAULT 'NOT_STARTED'::public.host_status,
    business_type public.host_business_type NOT NULL DEFAULT 'individual'::public.host_business_type,
    primary_accommodation_type_id UUID REFERENCES public.accommodation_types(id) ON DELETE SET NULL,
    business_name TEXT,
    bank_account_id UUID,
    bank_name TEXT,
    bank_account_last4 TEXT,
    tax_profile_id UUID,
    tax_id_last4 TEXT,
    tax_id_type TEXT,
    identity_verified_at TIMESTAMPTZ,
    agreed_to_policies_at TIMESTAMPTZ,
    support_phone TEXT,
    support_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS host_profiles_status_idx ON public.host_profiles(status);
CREATE INDEX IF NOT EXISTS idx_host_profiles_accommodation_type ON public.host_profiles(primary_accommodation_type_id);

ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- Least privilege RLS Policies
CREATE POLICY "Users can view their own host profile"
    ON public.host_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own host profile"
    ON public.host_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own host profile"
    ON public.host_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
