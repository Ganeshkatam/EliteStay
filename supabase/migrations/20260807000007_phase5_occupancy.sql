-- Phase 5.2: Occupancy & Availability Separation

-- 1. Create tenancy occupancy status
CREATE TYPE public.tenancy_occupancy_status AS ENUM (
  'PENDING_MOVE_IN',
  'OCCUPIED',
  'NOTICE_GIVEN',
  'VACATED'
);

-- Add occupancy_status to leases
ALTER TABLE public.leases 
ADD COLUMN occupancy_status public.tenancy_occupancy_status NOT NULL DEFAULT 'PENDING_MOVE_IN';

-- 2. Modify availability status for property
-- Existing: 'available', 'occupied', 'unavailable'
-- We will rename 'occupied' to 'reserved' and ensure all use cases align.

ALTER TYPE public.availability_status RENAME VALUE 'occupied' TO 'reserved';
