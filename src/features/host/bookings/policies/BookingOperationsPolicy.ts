/*
==================================================
Domain: Host Booking Operations - Policy Layer
Purpose: Evaluates operational queues, domain priority levels, attention SLA deadlines, and queue orderings.
==================================================
*/

import {
  BookingPriority,
  type OperationalQueueType,
  type EnrichedBookingRow,
} from '../types/booking.types';
import { BookingLifecyclePolicy } from './BookingLifecyclePolicy';

export interface AttentionPriorityBreakdown {
  total: number;
  criticalCount: number;
  highCount: number;
  normalCount: number;
}

export class BookingOperationsPolicy {
  /**
   * Classifies a persistence row into an operational host queue based on active attention requirements.
   */
  public static getOperationalQueue(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): OperationalQueueType {
    if (BookingLifecyclePolicy.isTerminalState(booking.status)) {
      return 'closed';
    }

    if (booking.status === 'pending') {
      // If already expired timestamp, classify as closed
      if (booking.expires_at && new Date(booking.expires_at) < referenceDate) {
        return 'closed';
      }
      return 'needs-attention';
    }

    if (booking.status === 'approved') {
      const moveInDateStr = booking.requested_move_in; // YYYY-MM-DD
      const todayStr = referenceDate.toISOString().split('T')[0];

      if (moveInDateStr === todayStr) {
        return 'today-move-ins';
      } else if (moveInDateStr < todayStr) {
        // Active or historical stay already begun
        return 'closed';
      } else {
        return 'upcoming';
      }
    }

    return 'closed';
  }

  /**
   * Computes domain priority without embedding UI presentation semantics.
   */
  public static getBookingPriority(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): BookingPriority {
    const queue = this.getOperationalQueue(booking, referenceDate);

    if (queue === 'closed') {
      return BookingPriority.NONE;
    }

    if (queue === 'needs-attention') {
      if (!booking.expires_at) {
        return BookingPriority.NORMAL;
      }
      const diffMs =
        new Date(booking.expires_at).getTime() - referenceDate.getTime();
      const hoursRemaining = diffMs / (1000 * 60 * 60);

      if (hoursRemaining <= 24) {
        return BookingPriority.CRITICAL;
      }
      if (hoursRemaining <= 72) {
        return BookingPriority.HIGH;
      }
      return BookingPriority.NORMAL;
    }

    if (queue === 'today-move-ins') {
      return BookingPriority.HIGH;
    }

    if (queue === 'upcoming') {
      return BookingPriority.LOW;
    }

    return BookingPriority.NONE;
  }

  /**
   * Exposes raw attention deadline timestamp so UI can decide relative SLA formatting ("Today", "2 days", etc.).
   */
  public static getAttentionDeadline(
    booking: EnrichedBookingRow
  ): string | null {
    if (booking.status === 'pending' && booking.expires_at) {
      return booking.expires_at;
    }
    if (booking.status === 'approved') {
      // Return move-in date at noon as the key milestone timestamp
      return `${booking.requested_move_in}T12:00:00Z`;
    }
    return null;
  }

  /**
   * Sorts an array of booking rows internally by operational priority (CRITICAL -> HIGH -> NORMAL -> LOW -> NONE),
   * tie-breaking by earliest deadline.
   */
  public static sortQueueByPriority(
    bookings: EnrichedBookingRow[],
    referenceDate: Date = new Date()
  ): EnrichedBookingRow[] {
    return [...bookings].sort((a, b) => {
      const pA = this.getBookingPriority(a, referenceDate);
      const pB = this.getBookingPriority(b, referenceDate);

      if (pA !== pB) {
        return pA - pB;
      }

      const deadA = this.getAttentionDeadline(a);
      const deadB = this.getAttentionDeadline(b);

      if (deadA && deadB) {
        return new Date(deadA).getTime() - new Date(deadB).getTime();
      }
      return 0;
    });
  }

  /**
   * Computes priority breakdown metrics for the Needs Attention queue.
   */
  public static getAttentionBreakdown(
    bookings: EnrichedBookingRow[],
    referenceDate: Date = new Date()
  ): AttentionPriorityBreakdown {
    let total = 0;
    let criticalCount = 0;
    let highCount = 0;
    let normalCount = 0;

    for (const booking of bookings) {
      if (
        this.getOperationalQueue(booking, referenceDate) === 'needs-attention'
      ) {
        total++;
        const priority = this.getBookingPriority(booking, referenceDate);
        if (priority === BookingPriority.CRITICAL) criticalCount++;
        else if (priority === BookingPriority.HIGH) highCount++;
        else if (priority === BookingPriority.NORMAL) normalCount++;
      }
    }

    return { total, criticalCount, highCount, normalCount };
  }
}
