import { NotificationPayload } from '../domain/notification.types';
import { ChannelAdapter } from '../adapters/channel.adapter';
import { NoopAdapter } from '../adapters/noop.adapter';
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType } from '@/lib/events/domain-events';

export class NotificationService {
  private adapter: ChannelAdapter;

  constructor(adapter: ChannelAdapter = new NoopAdapter()) {
    this.adapter = adapter;
  }

  public async dispatch(payload: NotificationPayload): Promise<void> {
    await this.adapter.send(payload);
  }

  /**
   * Binds the domain EventBus to the NotificationService to trigger automated comms.
   */
  public bindToEventBus(): void {
    eventBus.subscribeAll(async (domainEvent) => {
      // Stub mapping logic:
      if (domainEvent.type === DomainEventType.BOOKING_APPROVED) {
        // await this.dispatch({ ... })
      }
    });
  }
}

export const notificationService = new NotificationService();
