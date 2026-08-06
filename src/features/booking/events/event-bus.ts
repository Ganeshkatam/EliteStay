import { v4 as uuidv4 } from 'uuid';

export interface DomainEventMetadata {
  eventId: string;
  eventVersion: number;
  occurredAt: Date;
  correlationId: string;
  causationId?: string;
}

export abstract class DomainEvent {
  public readonly metadata: DomainEventMetadata;

  constructor(correlationId: string, causationId?: string) {
    this.metadata = {
      eventId: uuidv4(),
      eventVersion: 1,
      occurredAt: new Date(),
      correlationId,
      causationId,
    };
  }

  abstract get type(): string;
}

// Concrete Events

export class BookingDraftCreated extends DomainEvent {
  public readonly type = 'BookingDraftCreated';
  constructor(
    public readonly reservationId: string,
    public readonly propertyId: string,
    public readonly guestId: string,
    correlationId: string
  ) {
    super(correlationId);
  }
}

export class AvailabilityValidated extends DomainEvent {
  public readonly type = 'AvailabilityValidated';
  constructor(
    public readonly reservationId: string,
    correlationId: string
  ) {
    super(correlationId);
  }
}

export class LockAcquired extends DomainEvent {
  public readonly type = 'LockAcquired';
  constructor(
    public readonly reservationId: string,
    public readonly lockToken: string,
    correlationId: string
  ) {
    super(correlationId);
  }
}

export class PaymentAuthorized extends DomainEvent {
  public readonly type = 'PaymentAuthorized';
  constructor(
    public readonly reservationId: string,
    public readonly paymentIntentId: string,
    correlationId: string
  ) {
    super(correlationId);
  }
}

export class BookingConfirmed extends DomainEvent {
  public readonly type = 'BookingConfirmed';
  constructor(
    public readonly reservationId: string,
    public readonly propertyId: string,
    public readonly guestId: string,
    public readonly snapshotVersion: number,
    correlationId: string
  ) {
    super(correlationId);
  }
}

export class BookingCancelled extends DomainEvent {
  public readonly type = 'BookingCancelled';
  constructor(
    public readonly reservationId: string,
    public readonly reason: string,
    correlationId: string
  ) {
    super(correlationId);
  }
}

// Simple In-Memory Event Bus for now
// In a real system, this might publish to BullMQ, Google Cloud Pub/Sub, or Kafka
type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class EventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static handlers = new Map<string, EventHandler<any>[]>();

  // Optional: queue events and publish post-commit
  private static stagedEvents: DomainEvent[] = [];

  static subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  static stage(event: DomainEvent) {
    this.stagedEvents.push(event);
  }

  static async commitPublish() {
    const events = [...this.stagedEvents];
    this.stagedEvents = [];

    for (const event of events) {
      const handlers = this.handlers.get(event.type) || [];
      // Fire handlers asynchronously so they don't block the commit response
      // Handlers are isolated from each other.
      handlers.forEach((handler) => {
        Promise.resolve(handler(event)).catch((err) => {
          console.error(`[EventBus] Error in handler for ${event.type}:`, err);
        });
      });
    }
  }

  static rollback() {
    this.stagedEvents = [];
  }
}
