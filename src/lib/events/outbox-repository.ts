import { createClient } from '@/lib/supabase/server';
import { DomainEventType } from './domain-events';
import { OutboxDispatcher } from './outbox-dispatcher';

export interface OutboxEvent {
  type: DomainEventType;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

export class OutboxRepository {
  /**
   * Appends an event to the outbox queue.
   * This should ideally be executed in the same transaction as the domain entity update.
   */
  static async append(event: OutboxEvent): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('outbox_events').insert({
      type: event.type,
      aggregate_type: event.aggregateType,
      aggregate_id: event.aggregateId,
      payload: event.payload,
      correlation_id: event.correlationId || null,
      causation_id: event.causationId || null,
      status: 'PENDING',
    });

    if (error) {
      throw new Error(`Failed to append event to outbox: ${error.message}`);
    }

    // Asynchronously trigger the dispatcher to process the event
    // We don't await this so it doesn't block the caller's request lifecycle
    OutboxDispatcher.processPendingEvents().catch(console.error);
  }
}
