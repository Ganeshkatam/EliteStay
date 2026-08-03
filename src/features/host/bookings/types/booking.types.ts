/*
==================================================
Domain: Host Booking Operations
Purpose: Core type definitions for persistence rows, domain priorities, operational queues, and generic action contracts.
==================================================
*/

/**
 * Raw database enum values for bookings.status
 */
export type DatabaseBookingStatus =
  'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

/**
 * Domain-level lifecycle states exposed to ViewModels and UI, separating database schema from operational logic.
 */
export type BookingLifecycleState =
  | 'PENDING_REVIEW'
  | 'AWAITING_FULFILLMENT'
  | 'MOVE_IN_SCHEDULED'
  | 'ACTIVE_STAY'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

/**
 * Domain operational priority ranking.
 */
export enum BookingPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  NONE = 5,
}

/**
 * Identifiers for operational queue groupings.
 */
export type OperationalQueueType =
  'needs-attention' | 'today-move-ins' | 'upcoming' | 'closed';

/**
 * Dynamic configuration for rendering queue tabs in the workspace shell.
 */
export interface QueueDefinition {
  id: OperationalQueueType;
  label: string;
  count: number;
  priority: BookingPriority;
}

/**
 * Generic contract for operational buttons emitted by policies and ViewModels.
 */
export interface BookingAction {
  id: string;
  label: string;
  enabled: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  reasonDisabled?: string;
}

// Re-export shared contracts from central host module to enforce Single Source of Truth
export {
  type GuestSummary,
  type ListingSummary,
} from '@/features/host/shared/types/summary.types';

/**
 * Persistence layer output contract returned by BookingRepository.
 * Repositories must return explicit EnrichedBookingRow records, never ViewModels.
 */
export interface EnrichedBookingRow {
  id: string;
  listing_id: string;
  guest_id: string;
  requested_move_in: string;
  requested_duration: number;
  message: string | null;
  snapshot_monthly_rent: number;
  snapshot_security_deposit: number;
  snapshot_maintenance_fee: number;
  snapshot_billing_period: string;
  snapshot_minimum_stay: number;
  expires_at: string | null;
  status: DatabaseBookingStatus;
  created_at: string;
  updated_at: string;
  // Enriched joined attributes
  guest_name?: string;
  guest_avatar?: string | null;
  guest_email?: string;
  listing_title: string;
  listing_city?: string;
  listing_slug?: string;
}
