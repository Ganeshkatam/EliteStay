import { LeaseRepository } from '../repositories/lease.repository';
import { Lease, LeaseStatus } from '../types/lease.types';
import { LeaseLifecyclePolicy } from '../domain/lifecycle.policy';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';

export class LeaseService {
  /**
   * Creates a draft lease and its initial version snapshot.
   * Called when a RESERVATION_CONFIRMED event is received.
   */
  static async createDraftWithVersion(
    data: Omit<
      Lease,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentVersionId'
    >
  ): Promise<Lease> {
    const lease = await LeaseRepository.create(data);

    // Create the initial version snapshot
    await LeaseRepository.createVersion(
      lease.id,
      lease,
      'INITIAL',
      null // System-created
    );

    await OutboxRepository.append({
      type: DomainEventType.LEASE_DRAFT_CREATED,
      aggregateType: 'LEASE',
      aggregateId: lease.id,
      payload: {
        leaseId: lease.id,
        reservationId: lease.reservationId,
        tenantId: lease.tenantId,
      },
    });

    return lease;
  }

  /**
   * Host issues the lease to the tenant for review and signature.
   */
  static async issueLease(leaseId: string, hostId: string): Promise<void> {
    const lease = await LeaseRepository.getById(leaseId);
    if (!lease) throw new Error('Lease not found');

    LeaseLifecyclePolicy.validateTransition(lease.status, 'ISSUED');

    await LeaseRepository.updateStatus(leaseId, 'ISSUED');

    await OutboxRepository.append({
      type: DomainEventType.LEASE_ISSUED,
      aggregateType: 'LEASE',
      aggregateId: leaseId,
      payload: { leaseId, hostId },
    });
  }

  /**
   * Tenant signs the lease, accepting all terms.
   */
  static async signLease(leaseId: string, tenantId: string): Promise<void> {
    const lease = await LeaseRepository.getById(leaseId);
    if (!lease) throw new Error('Lease not found');
    if (lease.tenantId !== tenantId) throw new Error('Unauthorized');

    LeaseLifecyclePolicy.validateTransition(lease.status, 'SIGNED');

    await LeaseRepository.updateStatus(leaseId, 'SIGNED');

    await OutboxRepository.append({
      type: DomainEventType.LEASE_SIGNED,
      aggregateType: 'LEASE',
      aggregateId: leaseId,
      payload: { leaseId, tenantId },
    });
  }

  /**
   * Activates the lease after all prerequisites (deposit, move-in) are met.
   */
  static async activateLease(leaseId: string): Promise<void> {
    const lease = await LeaseRepository.getById(leaseId);
    if (!lease) throw new Error('Lease not found');

    LeaseLifecyclePolicy.validateTransition(lease.status, 'ACTIVE');

    await LeaseRepository.updateStatus(leaseId, 'ACTIVE');

    await OutboxRepository.append({
      type: DomainEventType.LEASE_ACTIVATED,
      aggregateType: 'LEASE',
      aggregateId: leaseId,
      payload: { leaseId },
    });
  }

  /**
   * Retrieves a lease by its ID.
   */
  static async getById(leaseId: string): Promise<Lease | null> {
    return LeaseRepository.getById(leaseId);
  }

  /**
   * Retrieves a lease by its reservation ID.
   */
  static async getByReservationId(
    reservationId: string
  ): Promise<Lease | null> {
    return LeaseRepository.getByReservationId(reservationId);
  }

  /**
   * Retrieves all leases for a tenant.
   */
  static async getByTenantId(tenantId: string): Promise<Lease[]> {
    return LeaseRepository.getByTenantId(tenantId);
  }
}
