/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStaticClient } from '@/lib/supabase/server';
import { DomainEvent, DomainEventType } from '@/lib/events/domain-events';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

export class TimelineService {
  /**
   * Writes an event to the domain_timeline table.
   * This is typically called by the EventBus listener.
   */
  static async recordEvent(
    event: DomainEvent<any>,
    entityType: string,
    entityId: string
  ): Promise<void> {
    const supabase = createStaticClient();

    const { error } = await supabase.from('domain_timeline').insert({
      entity_type: entityType,
      entity_id: entityId,
      event_type: event.type,
      actor_id: event.metadata?.actorId || null,
      correlation_id: event.metadata?.traceId || null,
      causation_id: null, // Depending on if we added causationId to event metadata
      metadata: event.payload,
    });

    if (error) {
      _logger.error('Failed to record domain timeline event', {
        error: error.message,
        eventId: event.id,
      });
      throw error;
    }
  }

  /**
   * Analyzes an event payload to determine the primary entity type and ID to associate with the timeline.
   */
  static extractTimelineEntity(
    event: DomainEvent<any>
  ): { entityType: string; entityId: string } | null {
    const p = event.payload as any;

    switch (event.type) {
      case DomainEventType.RENTAL_APPLICATION_SUBMITTED:
      case DomainEventType.RENTAL_APPLICATION_APPROVED:
      case DomainEventType.RENTAL_APPLICATION_REJECTED:
      case DomainEventType.RENTAL_APPLICATION_WITHDRAWN:
        if (p.applicationId)
          return { entityType: 'APPLICATION', entityId: p.applicationId };
        break;

      case DomainEventType.BOOKING_REQUESTED:
      case DomainEventType.BOOKING_APPROVED:
      case DomainEventType.BOOKING_REJECTED:
        if (p.reservationId)
          return { entityType: 'RESERVATION', entityId: p.reservationId };
        break;

      case DomainEventType.VIEWING_REQUESTED:
      case DomainEventType.VIEWING_CONFIRMED:
      case DomainEventType.VIEWING_COMPLETED:
        if (p.viewingRequestId)
          return { entityType: 'VIEWING', entityId: p.viewingRequestId };
        break;

      case DomainEventType.STAY_STARTED:
      case DomainEventType.STAY_ENDED:
        if (p.reservationId)
          return { entityType: 'STAY', entityId: p.reservationId };
        break;

      case DomainEventType.LEASE_DRAFT_CREATED:
      case DomainEventType.LEASE_ISSUED:
      case DomainEventType.LEASE_SIGNED:
      case DomainEventType.LEASE_ACTIVATED:
      case DomainEventType.LEASE_TERMINATED:
      case DomainEventType.LEASE_EXPIRED:
        if (p.leaseId) return { entityType: 'LEASE', entityId: p.leaseId };
        break;

      case DomainEventType.DEPOSIT_REQUESTED:
      case DomainEventType.DEPOSIT_COLLECTED:
      case DomainEventType.DEPOSIT_REFUNDED:
        if (p.depositId)
          return { entityType: 'DEPOSIT', entityId: p.depositId };
        break;

      case DomainEventType.MOVE_IN_SCHEDULED:
      case DomainEventType.MOVE_IN_COMPLETED:
        if (p.moveInId) return { entityType: 'MOVE_IN', entityId: p.moveInId };
        break;

      case DomainEventType.MAINTENANCE_REQUEST_CREATED:
      case DomainEventType.MAINTENANCE_ASSIGNED:
      case DomainEventType.MAINTENANCE_STARTED:
      case DomainEventType.MAINTENANCE_WAITING:
      case DomainEventType.MAINTENANCE_RESOLVED:
      case DomainEventType.MAINTENANCE_CLOSED:
        if (p.requestId)
          return { entityType: 'MAINTENANCE', entityId: p.requestId };
        break;

      case DomainEventType.INVOICE_CREATED:
      case DomainEventType.CHARGE_POSTED:
      case DomainEventType.PAYMENT_RECEIVED:
      case DomainEventType.PAYMENT_ALLOCATED:
      case DomainEventType.PAYMENT_REVERSED:
        if (p.invoiceId)
          return { entityType: 'INVOICE', entityId: p.invoiceId };
        if (p.ledgerEntryId)
          return { entityType: 'LEDGER_ENTRY', entityId: p.ledgerEntryId };
        break;

      case DomainEventType.DOCUMENT_UPLOADED:
      case DomainEventType.DOCUMENT_REPLACED:
      case DomainEventType.DOCUMENT_DELETED:
        if (p.documentId)
          return { entityType: 'DOCUMENT', entityId: p.documentId };
        break;

      case DomainEventType.NOTICE_CREATED:
      case DomainEventType.NOTICE_DELIVERED:
      case DomainEventType.NOTICE_READ:
        if (p.noticeId) return { entityType: 'NOTICE', entityId: p.noticeId };
        break;

      default:
        // By default, if the payload specifies an entityType and entityId explicitly
        if (p.entityType && p.entityId) {
          return { entityType: p.entityType, entityId: p.entityId };
        }
    }

    return null;
  }
}
