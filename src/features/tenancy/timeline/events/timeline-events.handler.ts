/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { TimelineService } from '../services/timeline.service';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

export function initializeTimelineEventHandlers() {
  // Listen to ALL events and record them in the timeline if they match an entity
  const eventsToTrack = Object.values(DomainEventType);

  eventsToTrack.forEach((eventType) => {
    eventBus.subscribe(
      eventType as DomainEventType,
      async (event: DomainEvent<any>) => {
        try {
          const entity = TimelineService.extractTimelineEntity(event);
          if (entity) {
            await TimelineService.recordEvent(
              event,
              entity.entityType,
              entity.entityId
            );
          }
        } catch (error) {
          _logger.error(
            `Failed to handle domain timeline for event ${event.type}`,
            { error }
          );
        }
      }
    );
  });
}
