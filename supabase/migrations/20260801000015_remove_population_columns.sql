-- 20260801000015_remove_population_columns.sql
-- Drop population column from states and cities tables

ALTER TABLE public.states DROP COLUMN IF EXISTS population;
ALTER TABLE public.cities DROP COLUMN IF EXISTS population;
