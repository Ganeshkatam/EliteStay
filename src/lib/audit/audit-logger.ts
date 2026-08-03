import { randomUUID } from 'crypto';
import { AuditEventType, AuditRecord } from './audit-events';
import { auditRepository } from './audit.repository';
import { eventBus } from '../events/event-bus';
import { DomainEventType } from '../events/domain-events';

export class AuditLogger {
  public async log(
    eventType: AuditEventType,
    actorId: string,
    metadata: Record<string, unknown> = {},
    targetId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const record: AuditRecord = {
      id: randomUUID(),
      eventType,
      actorId,
      targetId,
      timestamp: new Date().toISOString(),
      metadata,
      ipAddress,
      userAgent,
    };

    // Forward strictly to the AuditRepository, bypassing normal telemetry logging
    await auditRepository.insertRecord(record);
  }

  /**
   * Binds the domain EventBus to the AuditLogger for seamless event propagation.
   */
  public bindToEventBus(): void {
    eventBus.subscribeAll(async (domainEvent) => {
      if (domainEvent.type === DomainEventType.LISTING_PUBLISHED) {
        await this.log(
          AuditEventType.LISTING_PUBLISHED,
          domainEvent.metadata.actorId || 'SYSTEM',
          domainEvent.payload as Record<string, unknown>
        );
      } else if (domainEvent.type === DomainEventType.BOOKING_APPROVED) {
        await this.log(
          AuditEventType.BOOKING_APPROVED,
          domainEvent.metadata.actorId || 'SYSTEM',
          domainEvent.payload as Record<string, unknown>
        );
      } else if (domainEvent.type === DomainEventType.PAYOUT_ACCOUNT_CHANGED) {
        await this.log(
          AuditEventType.PAYOUT_ACCOUNT_CHANGED,
          domainEvent.metadata.actorId || 'SYSTEM',
          domainEvent.payload as Record<string, unknown>
        );
      }
      // Expand bindings as product requires
    });
  }
}

export const auditLogger = new AuditLogger();
