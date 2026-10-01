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

    const { error } = await supabase.rpc('append_outbox_event', {
      p_type: event.type,
      p_aggregate_type: event.aggregateType,
      p_aggregate_id: event.aggregateId,
      p_payload: event.payload as Record<string, unknown>,
      p_correlation_id: event.correlationId || null,
      p_causation_id: event.causationId || null,
    });

    if (error) {
      throw new Error(`Failed to append event to outbox: ${error.message}`);
    }

    // Asynchronously trigger the dispatcher to process the event
    // We don't await this so it doesn't block the caller's request lifecycle
    OutboxDispatcher.processPendingEvents().catch(console.error);
  }
}
