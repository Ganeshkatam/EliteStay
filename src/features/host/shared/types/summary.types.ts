/*
==================================================
Domain: Host Shared Module - Types
Purpose: Master type definitions for shared Guest, Listing, and Resident summaries across Bookings, Stays, and other Host workspaces.
==================================================
*/

/**
 * Shared Guest summary contract designed to serve across Bookings (Phase 6) and Stays (Phase 7).
 */
export interface GuestSummary {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  email?: string;
  phone?: string;
}

/**
 * Shared Listing summary contract designed to serve across Bookings (Phase 6) and Stays (Phase 7).
 */
export interface ListingSummary {
  id: string;
  title: string;
  city?: string;
  slug?: string;
  monthlyRent: number;
  securityDeposit: number;
}

/**
 * Resident occupancy summary contract extending guest data with active stay residency parameters for Phase 7.
 */
export interface ResidentSummary extends GuestSummary {
  stayId?: string;
  listingId?: string;
  listingTitle?: string;
  moveInDate?: string;
  moveOutDate?: string;
  roomOrUnitNumber?: string;
  occupancyState?: 'ACTIVE' | 'CHECKING_IN' | 'CHECKING_OUT' | 'FORMER';
}
