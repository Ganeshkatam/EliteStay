/*
==================================================
Migration: Update user_occupation ENUM
Purpose:
  Transition user_occupation enum from specific corporate job functions to broad resident lifestyle categories:
  - student
  - working_professional
  - business_owner
  - freelancer
  - job_seeker
  - retired
  - other
==================================================
*/

CREATE TYPE public.user_occupation_new AS ENUM (
    'student',
    'working_professional',
    'business_owner',
    'freelancer',
    'job_seeker',
    'retired',
    'other'
);

-- Migrate existing profile occupations to new categories
ALTER TABLE public.profiles 
  ALTER COLUMN occupation TYPE public.user_occupation_new 
  USING (
    CASE occupation::text
      WHEN 'software_engineer' THEN 'working_professional'::public.user_occupation_new
      WHEN 'healthcare_professional' THEN 'working_professional'::public.user_occupation_new
      WHEN 'education' THEN 'working_professional'::public.user_occupation_new
      WHEN 'design_creative' THEN 'working_professional'::public.user_occupation_new
      WHEN 'finance_accounting' THEN 'working_professional'::public.user_occupation_new
      WHEN 'marketing_sales' THEN 'working_professional'::public.user_occupation_new
      WHEN 'entrepreneur_founder' THEN 'business_owner'::public.user_occupation_new
      WHEN 'student' THEN 'student'::public.user_occupation_new
      WHEN 'freelancer' THEN 'freelancer'::public.user_occupation_new
      WHEN 'other' THEN 'other'::public.user_occupation_new
      ELSE NULL
    END
  );

DROP TYPE public.user_occupation;
ALTER TYPE public.user_occupation_new RENAME TO user_occupation;
