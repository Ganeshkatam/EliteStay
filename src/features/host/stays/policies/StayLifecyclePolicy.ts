/*
==================================================
Domain: Host Stay & Resident Operations - Lifecycle Policy
Purpose: Governs stay state transitions and maps raw persistence status to UI-agnostic domain states.
==================================================
*/

import {
  type EnrichedStayRow,
  type StayLifecycleState,
  type DatabaseStayStatus,
} from '../types/stay.types';

export class StayLifecyclePolicy {
  /**
   * Maps raw database stay records to domain lifecycle states per Refinement #3.
   * Strictly evaluates the status of the STAY rather than individual resident identity.
   */
  public static getLifecycleState(
    row: EnrichedStayRow,
    referenceDate: Date = new Date()
  ): StayLifecycleState {
    if (row.status === 'checked_out') {
      return 'CHECKED_OUT';
    }
    if (row.status === 'completed') {
      return 'COMPLETED';
    }
    if (row.status === 'terminated') {
      return 'TERMINATED';
    }
    if (row.status === 'upcoming') {
      return 'SCHEDULED_ARRIVAL';
    }

    // Active or extended residency evaluations
    const moveOut = new Date(row.expected_move_out_date);
    const daysUntilDeparture =
      (moveOut.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);

    // If within 7 days of expected departure and not yet checked out
    if (daysUntilDeparture <= 7 && daysUntilDeparture >= -30) {
      return 'DEPARTURE_PENDING';
    }

    if (row.status === 'extended') {
      return 'LEASE_EXTENDED';
    }

    return 'ACTIVE_RESIDENCE';
  }

  /**
   * Validates allowable domain state transitions before invoking atomic RPC execution.
   */
  public static canTransitionTo(
    current: DatabaseStayStatus,
    target: DatabaseStayStatus
  ): { allowed: boolean; reason?: string } {
    if (current === target) {
      return {
        allowed: false,
        reason: `Stay is already in "${target}" status.`,
      };
    }

    if (['checked_out', 'completed', 'terminated'].includes(current)) {
      return {
        allowed: false,
        reason:
          'Concluded or terminated stays cannot be transitioned to active states.',
      };
    }

    switch (target) {
      case 'active':
        return current === 'upcoming'
          ? { allowed: true }
          : {
              allowed: false,
              reason: 'Only upcoming stays can be activated via check-in.',
            };
      case 'extended':
        return ['active', 'extended'].includes(current)
          ? { allowed: true }
          : { allowed: false, reason: 'Only active stays can be extended.' };
      case 'checked_out':
      case 'completed':
      case 'terminated':
        return ['upcoming', 'active', 'extended'].includes(current)
          ? { allowed: true }
          : {
              allowed: false,
              reason: 'Invalid transition to concluded state.',
            };
      default:
        return { allowed: true };
    }
  }
}
