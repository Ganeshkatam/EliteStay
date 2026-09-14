import { ChannelAdapter } from './channel.adapter';
import { NotificationPayload } from '../domain/notification.types';
import { logger } from '@/lib/observability/logging/logger';

export class NoopAdapter implements ChannelAdapter {
  public async send(payload: NotificationPayload): Promise<void> {
    logger.info(
      `[NoopAdapter] Discarding notification for ${payload.recipientId}`,
      { payload }
    );
  }
}
