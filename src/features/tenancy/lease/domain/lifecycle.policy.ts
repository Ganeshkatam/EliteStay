import { LeaseStatus } from '../types/lease.types';

export class LeaseLifecyclePolicy {
  private static readonly TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
    DRAFT: ['GENERATED', 'TERMINATED'],
    GENERATED: ['ISSUED', 'DRAFT', 'TERMINATED'], // Can revert to draft if terms change
    ISSUED: ['SIGNED', 'GENERATED', 'TERMINATED'], // Can revert if renegotiating
    SIGNED: ['ACTIVE', 'TERMINATED'],
    ACTIVE: ['RENEWED', 'EXPIRED', 'TERMINATED'],
    RENEWED: ['EXPIRED', 'TERMINATED'], // Basically functionally equivalent to ACTIVE for a new term, could loop to ACTIVE
    EXPIRED: [],
    TERMINATED: [],
  };

  static canTransition(
    currentStatus: LeaseStatus,
    nextStatus: LeaseStatus
  ): boolean {
    if (currentStatus === nextStatus) return true;
    return this.TRANSITIONS[currentStatus].includes(nextStatus);
  }

  static validateTransition(
    currentStatus: LeaseStatus,
    nextStatus: LeaseStatus
  ): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new Error(
        `Invalid lease transition from ${currentStatus} to ${nextStatus}`
      );
    }
  }
}
