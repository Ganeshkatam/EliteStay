import { RentalApplicationStatus } from '../types/application.types';

export class ApplicationLifecyclePolicy {
  private static allowedTransitions: Record<
    RentalApplicationStatus,
    RentalApplicationStatus[]
  > = {
    DRAFT: ['SUBMITTED', 'WITHDRAWN'],
    SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN', 'EXPIRED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
    APPROVED: [], // Terminal for Application domain. Moves to StayReservation.
    REJECTED: [], // Terminal
    WITHDRAWN: [], // Terminal
    EXPIRED: [], // Terminal
  };

  /**
   * Validates if a transition from current state to target state is allowed.
   */
  static canTransition(
    currentStatus: RentalApplicationStatus,
    targetStatus: RentalApplicationStatus
  ): boolean {
    return this.allowedTransitions[currentStatus].includes(targetStatus);
  }

  /**
   * Throws an error if the transition is not allowed.
   */
  static validateTransition(
    currentStatus: RentalApplicationStatus,
    targetStatus: RentalApplicationStatus
  ): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `Invalid application state transition: Cannot move from ${currentStatus} to ${targetStatus}`
      );
    }
  }
}
