/*
==================================================
Domain: Host Booking Operations - Policy Layer
Purpose: Defines valid lifecycle state transitions and translates raw database status to operational lifecycle states.
==================================================
*/

import {
  type DatabaseBookingStatus,
  type BookingLifecycleState,
  type EnrichedBookingRow,
} from '../types/booking.types';

export class BookingLifecyclePolicy {
  /**
   * Maps database persistence status to domain lifecycle states, abstracting raw DB storage from the UI.
   */
  public static getLifecycleState(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): BookingLifecycleState {
    switch (booking.status) {
      case 'pending': {
        // If expired timestamp passed without decision, reflect as expired
        if (
          booking.expires_at &&
          new Date(booking.expires_at) < referenceDate
        ) {
          return 'EXPIRED';
        }
        return 'PENDING_REVIEW';
      }
      case 'approved': {
        const moveInDate = new Date(booking.requested_move_in);
        // If today is on or past requested move-in, transition logically to active stay readiness
        if (moveInDate <= referenceDate) {
          return 'ACTIVE_STAY';
        }
        // If move-in is scheduled in the future, return move-in scheduled
        return 'MOVE_IN_SCHEDULED';
      }
      case 'rejected':
        return 'REJECTED';
      case 'cancelled':
        return 'CANCELLED';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'PENDING_REVIEW';
    }
  }

  /**
   * Validates whether a state transition is permissible under domain rules.
   */
  public static canTransition(
    current: DatabaseBookingStatus,
    target: DatabaseBookingStatus
  ): boolean {
    if (current === target) return false;

    switch (current) {
      case 'pending':
        return ['approved', 'rejected', 'cancelled', 'expired'].includes(
          target
        );
      case 'approved':
        return ['cancelled'].includes(target);
      case 'rejected':
      case 'cancelled':
      case 'expired':
        // Terminal states cannot transition directly without explicit administrative or domain reinstatement
        return false;
      default:
        return false;
    }
  }

  /**
   * Checks if a booking is in a terminal state that requires no further routine host action.
   */
  public static isTerminalState(status: DatabaseBookingStatus): boolean {
    return (
      status === 'rejected' || status === 'cancelled' || status === 'expired'
    );
  }
}
