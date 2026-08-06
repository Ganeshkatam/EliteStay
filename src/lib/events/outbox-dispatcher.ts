import { createStaticClient } from '@/lib/supabase/server';
import { eventBus } from './event-bus';
import { DomainEventType } from './domain-events';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('TASK');
let isProcessing = false;

/**
 * Background Dispatcher for Transactional Outbox.
 * Processes pending outbox events and publishes them to the EventBus.
 */
export class OutboxDispatcher {
  /**
   * Triggers a run of the dispatcher. Ensures only one run happens concurrently.
   */
  static async processPendingEvents(): Promise<void> {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const supabase = createStaticClient();

      // We use the SECURITY DEFINER RPC to fetch pending events safely.
      const { data: events, error } = await supabase.rpc(
        'get_pending_outbox_events',
        {
          batch_size: 50,
        }
      );

      if (error) {
        _logger.error('Failed to fetch pending outbox events', { error });
        return;
      }

      if (!events || events.length === 0) {
        return;
      }

      for (const event of events) {
        try {
          // 1. Publish to in-memory EventBus
          // The EventBus will have a listener that writes to domain_timeline
          await eventBus.publish(event.type as DomainEventType, event.payload, {
            correlationId: event.correlation_id,
            causationId: event.causation_id,
          });

          // 2. Mark as processed
          await supabase.rpc('mark_outbox_event_processed', {
            event_id: event.id,
          });
        } catch (err) {
          _logger.error(`Failed to process outbox event ${event.id}`, {
            error: err,
          });
          await supabase.rpc('mark_outbox_event_failed', {
            event_id: event.id,
            error_msg: err instanceof Error ? err.message : String(err),
          });
        }
      }

      // If we processed a full batch, there might be more
      if (events.length === 50) {
        setTimeout(() => OutboxDispatcher.processPendingEvents(), 100);
      }
    } finally {
      isProcessing = false;
    }
  }
}
