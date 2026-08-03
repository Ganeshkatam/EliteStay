export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export interface NotificationPayload {
  recipientId: string;
  templateId: string;
  channels: NotificationChannel[];
  data: Record<string, unknown>;
}
