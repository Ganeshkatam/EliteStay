/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { MoveInService } from '../services/move-in.service';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

/**
 * Move-In Event Handlers
 *
 * The move-in aggregate is autonomous. It listens to DEPOSIT_COLLECTED
 * and creates a move-in checklist for the lease.
 */
export function initializeMoveInEventHandlers() {
  eventBus.subscribe(
    DomainEventType.DEPOSIT_COLLECTED,
    async (event: DomainEvent<any>) => {
      try {
        const { leaseId } = event.payload;
        if (!leaseId) {
          _logger.warn('DEPOSIT_COLLECTED event missing leaseId payload', {
            eventId: event.id,
          });
          return;
        }

        await MoveInService.createForLease(leaseId);

        _logger.info('Move-in created after deposit collection', { leaseId });
      } catch (error) {
        _logger.error(
          'Failed to handle DEPOSIT_COLLECTED for move-in creation',
          { error }
        );
      }
    }
  );
}
