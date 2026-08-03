/*
==================================================
Domain: Host Stay & Resident Operations - Domain Contracts
Purpose: Master type definitions for active residences, operational queues, residency health, and action capabilities.
==================================================
*/

import {
  type ResidentSummary,
  type ListingSummary,
} from '@/features/host/shared';
export { type ResidentSummary, type ListingSummary };

/**
 * Urgency-ordered operational queues for stays per Refinements #1, #2, & #5.
 * Order of execution: check-ins -> departures -> current-residents -> past-stays.
 */
export type StayQueueType =
  'check-ins' | 'departures' | 'current-residents' | 'past-stays';

/**
 * Domain operational severity used for sorting and badge highlighting.
 */
export enum StayPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
  NONE = 'NONE',
}

/**
 * UI-agnostic stay lifecycle state per Refinement #3.
 * Strictly describes the state of the STAY rather than resident identity.
 */
export type StayLifecycleState =
  | 'SCHEDULED_ARRIVAL'
  | 'ACTIVE_RESIDENCE'
  | 'LEASE_EXTENDED'
  | 'DEPARTURE_PENDING'
  | 'CHECKED_OUT'
  | 'COMPLETED'
  | 'TERMINATED';

/**
 * Overall Resident Health classification per Refinement #4.
 */
export type ResidentHealthScore =
  'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';

/**
 * Detailed breakdown of Resident Health contributors (Occupancy, Payments, Maintenance, Communication, Lease).
 */
export interface ResidentHealthBreakdown {
  occupancy: string;
  payments: string;
  maintenance: string;
  communication: string;
  lease: string;
  overall: ResidentHealthScore;
  actionRequired?: string;
}

/**
 * Database stay status enum matching public.stay_status in schema.
 */
export type DatabaseStayStatus =
  | 'upcoming'
  | 'active'
  | 'extended'
  | 'checked_out'
  | 'completed'
  | 'terminated';

/**
 * Enriched row returned by StayRepository per Repository Rule.
 * Contains pure persistence records without UI presentation ViewModels.
 */
export interface EnrichedStayRow {
  id: string;
  listing_id: string;
  guest_id: string;
  created_from_booking_id: string | null;
  expected_move_in_date: string;
  actual_move_in_date: string | null;
  expected_move_out_date: string;
  actual_move_out_date: string | null;
  agreed_amount: number;
  agreed_billing_period: string;
  security_deposit_paid: number;
  status: DatabaseStayStatus;
  created_at: string;
  updated_at: string;
  // Enriched relational attributes
  guest_name: string;
  guest_avatar?: string | null;
  guest_email?: string;
  guest_phone?: string;
  listing_title: string;
  listing_city?: string;
  listing_slug?: string;
}

/**
 * Action contract emitted by StayDecisionPolicy governing check-in, check-out, extensions, terminations, and transfers.
 */
export interface StayAction {
  id:
    | 'confirm-checkin'
    | 'confirm-checkout'
    | 'extend-stay'
    | 'terminate-stay'
    | 'transfer-unit'
    | string;
  label: string;
  enabled: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  reasonDisabled?: string;
}

/**
 * Dynamic configuration for rendering queue navigation tabs.
 */
export interface StayQueueDefinition {
  id: StayQueueType;
  label: string;
  count: number;
  priority: StayPriority;
}
