/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { DepositService } from '../services/deposit.service';
import { LeaseService } from '@/features/tenancy/lease/services/lease.service';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

/**
 * Deposit Event Handlers
 *
 * The deposit aggregate is autonomous. It listens to LEASE_SIGNED
 * and automatically creates a PENDING security deposit for the lease.
 */
export function initializeDepositEventHandlers() {
  eventBus.subscribe(
    DomainEventType.LEASE_SIGNED,
    async (event: DomainEvent<any>) => {
      try {
        const { leaseId } = event.payload;
        if (!leaseId) {
          _logger.warn('LEASE_SIGNED event missing leaseId payload', {
            eventId: event.id,
          });
          return;
        }

        const lease = await LeaseService.getById(leaseId);
        if (!lease) {
          _logger.error(`Lease ${leaseId} not found for deposit creation`, {
            eventId: event.id,
          });
          return;
        }

        await DepositService.createForLease(
          leaseId,
          lease.securityDepositAmount
        );

        _logger.info('Security deposit created for signed lease', {
          leaseId,
          amount: lease.securityDepositAmount,
        });
      } catch (error) {
        _logger.error('Failed to handle LEASE_SIGNED for deposit creation', {
          error,
        });
      }
    }
  );
}
