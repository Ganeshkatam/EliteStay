import { NotificationPayload } from '../domain/notification.types';

export interface ChannelAdapter {
  send(payload: NotificationPayload): Promise<boolean>;
}
