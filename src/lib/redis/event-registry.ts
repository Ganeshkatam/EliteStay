/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomainEventType, DomainEvent } from '../events/domain-events';
import { eventBus } from '../events/event-bus';
import { invalidateTag } from './invalidation';

type TagResolver = (payload: any) => string[];

/**
 * Data-Driven Invalidation Registry.
 * Maps Domain Events to the cache tags they should invalidate.
 */
export const CacheEventRegistry: Partial<Record<DomainEventType, TagResolver>> =
  {
    [DomainEventType.LISTING_PUBLISHED]: (payload: { listingId: string }) => [
      `property:${payload.listingId}`,
      'search',
      'homepage',
    ],
    [DomainEventType.LISTING_DELETED]: (payload: { listingId: string }) => [
      `property:${payload.listingId}`,
      'search',
      'homepage',
    ],
    [DomainEventType.BOOKING_APPROVED]: (payload: { propertyId: string }) => [
      `property:${payload.propertyId}`, // impacts availability/pricing potentially
    ],
  };

/**
 * Subscribes to all domain events and invalidates cache tags based on the registry.
 */
export function initializeEventDrivenInvalidation(): void {
  eventBus.subscribeAll(async (event: DomainEvent) => {
    const resolver = CacheEventRegistry[event.type];
    if (!resolver) return;

    try {
      const tags = resolver(event.payload);
      for (const tag of tags) {
        await invalidateTag(tag);
      }
    } catch (err) {
      console.error(
        `[CacheInvalidator] Failed to invalidate tags for event ${event.type}:`,
        err
      );
    }
  });
}
