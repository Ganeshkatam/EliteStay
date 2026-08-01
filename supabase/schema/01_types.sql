/*
==================================================
Domain: Types
Purpose: Defines shared types and enums used across all domains.
Contains: 
- user_role
- listing_status
- booking_status
- stay_status
- billing_period
- availability_status
- occupancy_type
- gender_preference
- furnishing
==================================================
*/

CREATE TYPE public.user_role AS ENUM ('guest', 'host', 'admin');
CREATE TYPE public.listing_status AS ENUM ('draft', 'ready', 'pending_review', 'published', 'paused', 'archived');
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'expired');
CREATE TYPE public.stay_status AS ENUM ('upcoming', 'active', 'extended', 'checked_out', 'completed', 'terminated');
CREATE TYPE public.billing_period AS ENUM ('day', 'week', 'month', 'semester', 'year');
CREATE TYPE public.availability_status AS ENUM ('available', 'occupied', 'unavailable');
CREATE TYPE public.occupancy_type AS ENUM ('private', 'shared', 'mixed');
CREATE TYPE public.gender_preference AS ENUM ('any', 'male', 'female');
CREATE TYPE public.furnishing AS ENUM ('unfurnished', 'semi_furnished', 'fully_furnished');
CREATE TYPE public.availability_source AS ENUM ('booking', 'manual_block', 'external_calendar', 'maintenance');
