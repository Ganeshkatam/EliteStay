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

  public publish<T>(
    type: DomainEventType,
    payload: T,
    options?: { actorId?: string; correlationId?: string; causationId?: string }
  ): void {
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

    // Fire and forget - don't block the caller's business transaction
    Promise.allSettled(
      handlers.map((handler) => handler(event as DomainEvent))
    ).catch((err) => {
      console.error('[EventBus] Error dispatching event:', err);
    });
  }
}

export const eventBus = new EventBus();
