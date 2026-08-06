import { auditLogger } from '@/lib/audit/audit-logger';
import { initializeEventDrivenInvalidation } from '@/lib/redis/event-registry';
import { initializeApplicationEventHandlers } from '@/features/application/events/application-events.handler';
import { initializeTimelineEventHandlers } from '@/features/tenancy/timeline/events/timeline-events.handler';
import { initializeLeaseEventHandlers } from '@/features/tenancy/lease/events/lease-events.handler';
import { initializeDepositEventHandlers } from '@/features/tenancy/deposit/events/deposit-events.handler';
import { initializeMoveInEventHandlers } from '@/features/tenancy/move-in/events/move-in-events.handler';
import { initializeOccupancyEventHandlers } from '@/features/tenancy/occupancy/events/occupancy-events.handler';

export function bootstrapNode() {
  auditLogger.bindToEventBus();
  initializeEventDrivenInvalidation();
  initializeApplicationEventHandlers();
  initializeTimelineEventHandlers();
  initializeLeaseEventHandlers();
  initializeDepositEventHandlers();
  initializeMoveInEventHandlers();
  initializeOccupancyEventHandlers();
}
