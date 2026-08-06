import { DepositRepository } from '../repositories/deposit.repository';
import { SecurityDeposit } from '../types/deposit.types';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';

export class DepositService {
  /**
   * Creates a PENDING security deposit for a lease.
   * Called automatically when a LEASE_SIGNED event is received.
   */
  static async createForLease(
    leaseId: string,
    amount: number
  ): Promise<SecurityDeposit> {
    const deposit = await DepositRepository.create(leaseId, amount);

    await OutboxRepository.append({
      type: DomainEventType.DEPOSIT_REQUESTED,
      aggregateType: 'DEPOSIT',
      aggregateId: deposit.id,
      payload: {
        depositId: deposit.id,
        leaseId,
        amount,
      },
    });

    return deposit;
  }

  /**
   * Host confirms offline deposit collection.
   * Manual tracking -- no payment gateway involved.
   */
  static async markCollected(depositId: string): Promise<void> {
    const deposit = await DepositRepository.getById(depositId);
    if (!deposit) throw new Error('Security deposit not found');
    if (deposit.status !== 'PENDING') {
      throw new Error(`Cannot collect deposit in status ${deposit.status}`);
    }

    await DepositRepository.updateStatus(depositId, 'COLLECTED', {
      collected_at: new Date().toISOString(),
    });

    await OutboxRepository.append({
      type: DomainEventType.DEPOSIT_COLLECTED,
      aggregateType: 'DEPOSIT',
      aggregateId: depositId,
      payload: {
        depositId,
        leaseId: deposit.leaseId,
      },
    });
  }

  /**
   * Retrieves the deposit for a specific lease.
   */
  static async getByLeaseId(leaseId: string): Promise<SecurityDeposit | null> {
    return DepositRepository.getByLeaseId(leaseId);
  }
}
