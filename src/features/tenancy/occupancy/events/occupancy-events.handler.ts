/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { OccupancyService } from '../services/occupancy.service';
import { LeaseService } from '@/features/tenancy/lease/services/lease.service';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

/**
 * Occupancy Event Handlers
 *
 * Occupancy is a derived projection. These handlers listen to lifecycle events
 * and update the occupancy status accordingly:
 *   MOVE_IN_COMPLETED  -> OCCUPIED
 *   LEASE_EXPIRED      -> VACATED
 *   LEASE_TERMINATED   -> VACATED
 *
 * Additionally, when a move-in completes, the lease is activated.
 */
export function initializeOccupancyEventHandlers() {
  eventBus.subscribe(
    DomainEventType.MOVE_IN_COMPLETED,
    async (event: DomainEvent<any>) => {
      try {
        const { leaseId } = event.payload;
        if (!leaseId) return;

        // Mark occupancy as OCCUPIED
        await OccupancyService.markOccupied(leaseId);

        // Activate the lease
        await LeaseService.activateLease(leaseId);

        _logger.info(
          'Occupancy updated and lease activated after move-in completion',
          { leaseId }
        );
      } catch (error) {
        _logger.error('Failed to handle MOVE_IN_COMPLETED for occupancy', {
          error,
        });
      }
    }
  );

  eventBus.subscribe(
    DomainEventType.LEASE_EXPIRED,
    async (event: DomainEvent<any>) => {
      try {
        const { leaseId } = event.payload;
        if (!leaseId) return;

        await OccupancyService.markVacated(leaseId);
      } catch (error) {
        _logger.error('Failed to handle LEASE_EXPIRED for occupancy', {
          error,
        });
      }
    }
  );

  eventBus.subscribe(
    DomainEventType.LEASE_TERMINATED,
    async (event: DomainEvent<any>) => {
      try {
        const { leaseId } = event.payload;
        if (!leaseId) return;

        await OccupancyService.markVacated(leaseId);
      } catch (error) {
        _logger.error('Failed to handle LEASE_TERMINATED for occupancy', {
          error,
        });
      }
    }
  );
}
