-- Phase 4.3: Applicant Profiles

CREATE TABLE public.applicant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  employment_status TEXT,
  student_status TEXT,
  income_range TEXT,
  pet_information TEXT,
  guarantor_information TEXT,
  smoking_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for applicant_profiles
CREATE POLICY "Guests can manage their own applicant profiles" ON public.applicant_profiles FOR ALL USING (auth.uid() = guest_id);

-- Trigger for updated_at
CREATE TRIGGER applicant_profiles_updated_at
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add applicant_profile_id to rental_applications
ALTER TABLE public.rental_applications
  ADD COLUMN applicant_profile_id UUID REFERENCES public.applicant_profiles(id);

-- Drop the old inline columns from rental_applications
ALTER TABLE public.rental_applications
  DROP COLUMN IF EXISTS employment_status,
  DROP COLUMN IF EXISTS student_status,
  DROP COLUMN IF EXISTS income_range,
  DROP COLUMN IF EXISTS pet_information,
  DROP COLUMN IF EXISTS guarantor_information,
  DROP COLUMN IF EXISTS smoking_preference;
