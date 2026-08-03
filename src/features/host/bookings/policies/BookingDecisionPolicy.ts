/*
==================================================
Domain: Host Booking Operations - Policy Layer
Purpose: Business logic and decision validation rules governing booking approvals, rejections, rescheduling, and stay conversions.
==================================================
*/

import {
  type EnrichedBookingRow,
  type BookingAction,
} from '../types/booking.types';
import { BookingLifecyclePolicy } from './BookingLifecyclePolicy';

export interface DecisionValidationResult {
  allowed: boolean;
  reason?: string;
}

export class BookingDecisionPolicy {
  /**
   * Validates whether a booking request meets business rules for host approval.
   */
  public static validateApproval(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): DecisionValidationResult {
    if (booking.status !== 'pending') {
      return {
        allowed: false,
        reason: 'Only pending bookings can be approved.',
      };
    }
    if (booking.expires_at && new Date(booking.expires_at) < referenceDate) {
      return { allowed: false, reason: 'This booking request has expired.' };
    }
    // Future business rules (capacity checks, deposit escrow verification, listing readiness) integrate here
    return { allowed: true };
  }

  /**
   * Validates whether a booking request can be declined/rejected by the host.
   */
  public static validateRejection(
    booking: EnrichedBookingRow
  ): DecisionValidationResult {
    if (booking.status !== 'pending') {
      return {
        allowed: false,
        reason: 'Only pending requests can be rejected.',
      };
    }
    return { allowed: true };
  }

  /**
   * Validates whether an approved booking can be rescheduled to new move-in dates.
   */
  public static validateRescheduling(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): DecisionValidationResult {
    if (booking.status !== 'approved') {
      return {
        allowed: false,
        reason: 'Only approved bookings can be rescheduled.',
      };
    }
    const moveInDate = new Date(booking.requested_move_in);
    if (moveInDate < referenceDate) {
      return {
        allowed: false,
        reason: 'Cannot reschedule a stay that has already commenced.',
      };
    }
    return { allowed: true };
  }

  /**
   * Validates readiness for conversion to an active Resident Stay (Phase 7 bridge).
   */
  public static validateStayConversion(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): DecisionValidationResult {
    if (booking.status !== 'approved') {
      return {
        allowed: false,
        reason: 'Only approved bookings can be converted to an active stay.',
      };
    }
    const moveInStr = booking.requested_move_in;
    const todayStr = referenceDate.toISOString().split('T')[0];
    if (moveInStr > todayStr) {
      return { allowed: false, reason: 'Move-in date has not arrived yet.' };
    }
    return { allowed: true };
  }

  /**
   * Emits dynamic, domain-validated action buttons for representation in ViewModels.
   * Prevents hardcoded action logic inside presentation UI components.
   */
  public static getAvailableActions(
    booking: EnrichedBookingRow,
    referenceDate: Date = new Date()
  ): BookingAction[] {
    const actions: BookingAction[] = [];
    const lifecycleState = BookingLifecyclePolicy.getLifecycleState(
      booking,
      referenceDate
    );

    if (lifecycleState === 'PENDING_REVIEW') {
      const approveCheck = this.validateApproval(booking, referenceDate);
      actions.push({
        id: 'approve',
        label: 'Approve Request',
        enabled: approveCheck.allowed,
        variant: 'primary',
        reasonDisabled: approveCheck.reason,
      });

      const rejectCheck = this.validateRejection(booking);
      actions.push({
        id: 'reject',
        label: 'Decline',
        enabled: rejectCheck.allowed,
        variant: 'outline',
        reasonDisabled: rejectCheck.reason,
      });
    } else if (lifecycleState === 'MOVE_IN_SCHEDULED') {
      const rescheduleCheck = this.validateRescheduling(booking, referenceDate);
      actions.push({
        id: 'reschedule',
        label: 'Reschedule Move-in',
        enabled: rescheduleCheck.allowed,
        variant: 'secondary',
        reasonDisabled: rescheduleCheck.reason,
      });
    } else if (lifecycleState === 'ACTIVE_STAY') {
      const stayCheck = this.validateStayConversion(booking, referenceDate);
      actions.push({
        id: 'convert-to-stay',
        label: 'Check In & Convert to Stay',
        enabled: stayCheck.allowed,
        variant: 'primary',
        reasonDisabled: stayCheck.reason,
      });
    }

    return actions;
  }
}
