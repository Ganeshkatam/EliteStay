/*
==================================================
Migration: Add available_date to Listings Aggregate
Purpose:
  Align listing and search domain terminology with "Available Date" (when is this accommodation available for occupancy),
  while preserving "move-in" terminology specifically for bookings and stays (actual resident check-in timeline).
==================================================
*/

ALTER TABLE public.listings 
  ADD COLUMN IF NOT EXISTS available_date DATE DEFAULT CURRENT_DATE NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_available_date ON public.listings(available_date);
