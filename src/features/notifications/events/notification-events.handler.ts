import { eventBus } from '@/lib/events/event-bus';
import { DomainEvent, DomainEventType } from '@/lib/events/domain-events';
import { notificationRepository } from '../repositories/notification.repository';
import { NotificationEventType } from '../domain/notification-events';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

export function registerNotificationEventHandlers() {
  eventBus.subscribeAll(async (event: DomainEvent) => {
    try {
      await handleDomainEvent(event);
    } catch (error) {
      _logger.error(
        `Failed to handle domain event for notifications: ${event.id}`,
        { error }
      );
      throw error; // Rethrowing lets the outbox retry or mark as failed
    }
  });
}

async function handleDomainEvent(event: DomainEvent) {
  // Mapping logic from Domain Event -> Notification Payload
  switch (event.type) {
    case DomainEventType.BOOKING_REQUESTED:
      await handleBookingRequested(event as DomainEvent<BookingEventPayload>);
      break;
    case DomainEventType.BOOKING_APPROVED:
      await handleBookingApproved(event as DomainEvent<BookingEventPayload>);
      break;
    case DomainEventType.BOOKING_REJECTED:
      await handleBookingDeclined(event as DomainEvent<BookingEventPayload>);
      break;
    // We will add more handlers here as we progress through the phases
  }
}

// --------------------------------------------------------------------
// Handlers
// --------------------------------------------------------------------

interface BookingEventPayload {
  bookingId?: string;
  hostId?: string;
  guestId?: string;
  listingId?: string;
  listingTitle?: string;
  [key: string]: unknown;
}

async function handleBookingRequested(event: DomainEvent<BookingEventPayload>) {
  const { hostId, listingId, listingTitle } = event.payload;

  await notificationRepository.create({
    recipientId: hostId || '', // resolved from domain event
    category: 'BOOKING',
    eventType: NotificationEventType.BOOKING_REQUESTED,
    entityType: 'BOOKING',
    entityId: event.payload.bookingId,
    metadata: { listingId, listingTitle },
    title: 'New booking request',
    message: `A resident has requested to book ${listingTitle || 'your listing'}.`,
    actionPath: `/host/stays`,
    sourceEventId: event.id,
  });
}

async function handleBookingApproved(event: DomainEvent<BookingEventPayload>) {
  const { guestId, listingId, listingTitle } = event.payload;

  await notificationRepository.create({
    recipientId: guestId || '',
    category: 'BOOKING',
    eventType: NotificationEventType.BOOKING_APPROVED,
    entityType: 'BOOKING',
    entityId: event.payload.bookingId,
    metadata: { listingId, listingTitle },
    title: 'Booking confirmed',
    message: `Your booking for ${listingTitle || 'the listing'} has been approved.`,
    actionPath: `/users/bookings`,
    sourceEventId: event.id,
  });
}

async function handleBookingDeclined(event: DomainEvent<BookingEventPayload>) {
  const { guestId, listingId, listingTitle } = event.payload;

  await notificationRepository.create({
    recipientId: guestId || '',
    category: 'BOOKING',
    eventType: NotificationEventType.BOOKING_DECLINED,
    entityType: 'BOOKING',
    entityId: event.payload.bookingId,
    metadata: { listingId, listingTitle },
    title: 'Booking declined',
    message: `Your booking request for ${listingTitle || 'the listing'} was declined.`,
    actionPath: `/users/bookings`,
    sourceEventId: event.id,
  });
}
