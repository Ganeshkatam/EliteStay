import { MoveInRepository } from '../repositories/move-in.repository';
import { MoveIn, MoveInChecklistField } from '../types/move-in.types';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';

/**
 * All checklist fields that must be true before a move-in can be completed.
 */
const REQUIRED_CHECKLIST_FIELDS: MoveInChecklistField[] = [
  'depositVerified',
  'identityVerified',
  'keysIssued',
  'conditionReportSigned',
  'inventoryCompleted',
  'utilityInformationShared',
  'emergencyContactsConfirmed',
];

export class MoveInService {
  /**
   * Creates a PENDING move-in for a lease.
   * Called automatically when a DEPOSIT_COLLECTED event is received.
   */
  static async createForLease(leaseId: string): Promise<MoveIn> {
    const moveIn = await MoveInRepository.create(leaseId);

    await OutboxRepository.append({
      type: DomainEventType.MOVE_IN_SCHEDULED,
      aggregateType: 'MOVE_IN',
      aggregateId: moveIn.id,
      payload: {
        moveInId: moveIn.id,
        leaseId,
      },
    });

    return moveIn;
  }

  /**
   * Schedules the move-in to a specific date.
   */
  static async schedule(
    moveInId: string,
    scheduledDate: string
  ): Promise<void> {
    const moveIn = await MoveInRepository.getById(moveInId);
    if (!moveIn) throw new Error('Move-in not found');
    if (moveIn.status !== 'PENDING' && moveIn.status !== 'SCHEDULED') {
      throw new Error(`Cannot schedule move-in in status ${moveIn.status}`);
    }

    await MoveInRepository.schedule(moveInId, scheduledDate);
  }

  /**
   * Updates a single checklist field on the move-in.
   */
  static async updateChecklistItem(
    moveInId: string,
    field: MoveInChecklistField,
    value: boolean
  ): Promise<void> {
    await MoveInRepository.updateChecklistField(moveInId, field, value);
  }

  /**
   * Completes the move-in if all checklist items are satisfied.
   * Emits MOVE_IN_COMPLETED, which triggers the OccupancyService.
   */
  static async complete(moveInId: string): Promise<void> {
    const moveIn = await MoveInRepository.getById(moveInId);
    if (!moveIn) throw new Error('Move-in not found');

    if (moveIn.status === 'COMPLETED') return; // Idempotent
    if (moveIn.status === 'CANCELLED') {
      throw new Error('Cannot complete a cancelled move-in');
    }

    // Validate all checklist items are complete
    const incomplete = REQUIRED_CHECKLIST_FIELDS.filter(
      (field) => !moveIn[field]
    );

    if (incomplete.length > 0) {
      throw new Error(
        `Cannot complete move-in. Missing checklist items: ${incomplete.join(', ')}`
      );
    }

    await MoveInRepository.updateStatus(moveInId, 'COMPLETED');

    await OutboxRepository.append({
      type: DomainEventType.MOVE_IN_COMPLETED,
      aggregateType: 'MOVE_IN',
      aggregateId: moveInId,
      payload: {
        moveInId,
        leaseId: moveIn.leaseId,
      },
    });
  }

  /**
   * Retrieves the move-in for a specific lease.
   */
  static async getByLeaseId(leaseId: string): Promise<MoveIn | null> {
    return MoveInRepository.getByLeaseId(leaseId);
  }
}
