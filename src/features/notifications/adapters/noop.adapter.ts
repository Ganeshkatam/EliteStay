import { ChannelAdapter } from './channel.adapter';
import { NotificationPayload } from '../domain/notification.types';

export class NoopAdapter implements ChannelAdapter {
  public async send(payload: NotificationPayload): Promise<boolean> {
    // A placeholder adapter that gracefully simulates notifications during platform development
    console.log(
      `[NoopAdapter] Simulated delivery to ${payload.recipientId} via [${payload.channels.join(',')}] for template: ${payload.templateId}`
    );
    return true;
  }
}
