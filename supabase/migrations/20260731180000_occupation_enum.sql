CREATE TYPE public.user_occupation AS ENUM (
  'student',
  'software_engineer',
  'healthcare_professional',
  'education',
  'design_creative',
  'finance_accounting',
  'marketing_sales',
  'entrepreneur_founder',
  'freelancer',
  'other'
);

ALTER TABLE public.profiles 
  ALTER COLUMN occupation TYPE public.user_occupation 
  USING (
    CASE 
      WHEN occupation = 'Student' THEN 'student'::public.user_occupation
      WHEN occupation = 'Software Engineer' THEN 'software_engineer'::public.user_occupation
      WHEN occupation = 'Healthcare Professional' THEN 'healthcare_professional'::public.user_occupation
      WHEN occupation = 'Education' THEN 'education'::public.user_occupation
      WHEN occupation = 'Design / Creative' THEN 'design_creative'::public.user_occupation
      WHEN occupation = 'Finance / Accounting' THEN 'finance_accounting'::public.user_occupation
      WHEN occupation = 'Marketing / Sales' THEN 'marketing_sales'::public.user_occupation
      WHEN occupation = 'Entrepreneur / Founder' THEN 'entrepreneur_founder'::public.user_occupation
      WHEN occupation = 'Freelancer' THEN 'freelancer'::public.user_occupation
      WHEN occupation = 'Other' THEN 'other'::public.user_occupation
      ELSE NULL
    END
  );
