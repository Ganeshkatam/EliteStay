/*
==================================================
Domain: Host Booking Operations - ViewModels
Purpose: Reusable card representation for bookings across operational queues, dashboards, and notifications.
==================================================
*/

import {
  type BookingLifecycleState,
  type BookingPriority,
  type OperationalQueueType,
  type BookingAction,
  type GuestSummary,
  type ListingSummary,
  type EnrichedBookingRow,
} from '../types/booking.types';
import { BookingLifecyclePolicy } from '../policies/BookingLifecyclePolicy';
import { BookingOperationsPolicy } from '../policies/BookingOperationsPolicy';
import { BookingDecisionPolicy } from '../policies/BookingDecisionPolicy';

export interface BookingCardViewModel {
  id: string;
  guest: GuestSummary;
  listing: ListingSummary;
  requestedMoveIn: string;
  requestedDuration: number;
  message: string | null;
  financials: {
    monthlyRent: number;
    securityDeposit: number;
    maintenanceFee: number;
    billingPeriod: string;
    minimumStay: number;
  };
  lifecycleState: BookingLifecycleState;
  priority: BookingPriority;
  queue: OperationalQueueType;
  attentionDeadline: string | null;
  actions: BookingAction[];
}

/**
 * Factory to compose a pure presentation ViewModel from a persisted database entity.
 * Guarantees zero DB column leak into presentation UI components.
 */
export function createBookingCardViewModel(
  row: EnrichedBookingRow,
  referenceDate: Date = new Date()
): BookingCardViewModel {
  return {
    id: row.id,
    guest: {
      id: row.guest_id,
      fullName: row.guest_name || 'Guest User',
      avatarUrl: row.guest_avatar,
      email: row.guest_email,
    },
    listing: {
      id: row.listing_id,
      title: row.listing_title || 'Accommodations Listing',
      city: row.listing_city,
      slug: row.listing_slug,
      monthlyRent: Number(row.snapshot_monthly_rent || 0),
      securityDeposit: Number(row.snapshot_security_deposit || 0),
    },
    requestedMoveIn: row.requested_move_in,
    requestedDuration: Number(row.requested_duration || 1),
    message: row.message,
    financials: {
      monthlyRent: Number(row.snapshot_monthly_rent || 0),
      securityDeposit: Number(row.snapshot_security_deposit || 0),
      maintenanceFee: Number(row.snapshot_maintenance_fee || 0),
      billingPeriod: row.snapshot_billing_period || 'monthly',
      minimumStay: Number(row.snapshot_minimum_stay || 1),
    },
    lifecycleState: BookingLifecyclePolicy.getLifecycleState(
      row,
      referenceDate
    ),
    priority: BookingOperationsPolicy.getBookingPriority(row, referenceDate),
    queue: BookingOperationsPolicy.getOperationalQueue(row, referenceDate),
    attentionDeadline: BookingOperationsPolicy.getAttentionDeadline(row),
    actions: BookingDecisionPolicy.getAvailableActions(row, referenceDate),
  };
}
