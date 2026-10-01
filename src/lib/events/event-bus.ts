import { randomUUID } from 'crypto';
import { DomainEvent, DomainEventType } from './domain-events';
import { RequestContext } from '../observability/context/request-context';

export type EventSubscriber = (event: DomainEvent) => void | Promise<void>;

export class EventBus {
  private subscribers: Map<DomainEventType, Set<EventSubscriber>> = new Map();
  private globalSubscribers: Set<EventSubscriber> = new Set();

  public subscribe(type: DomainEventType, handler: EventSubscriber): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(handler);
  }

  public subscribeAll(handler: EventSubscriber): void {
    this.globalSubscribers.add(handler);
  }

  public async publish<T>(
    type: DomainEventType,
    payload: T,
    options?: { actorId?: string; correlationId?: string; causationId?: string }
  ): Promise<void> {
    const event: DomainEvent<T> = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      metadata: {
        actorId: options?.actorId,
        traceId: options?.correlationId || RequestContext.getTraceId(),
      },
      payload,
    };

    const handlers = [
      ...(this.subscribers.get(type) || []),
      ...this.globalSubscribers,
    ];

    const results = await Promise.allSettled(
      handlers.map((handler) => handler(event as DomainEvent))
    );

    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    );

    if (failures.length > 0) {
      console.error(
        `[EventBus] Errors dispatching event ${type}:`,
        failures.map((f) => f.reason)
      );
      throw new Error(
        `Failed to process event ${type}: ${failures.map((f) => f.reason?.message || String(f.reason)).join(', ')}`
      );
    }
  }
}

export const eventBus = new EventBus();
