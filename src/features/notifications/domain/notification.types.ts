export type NotificationCategory =
  | 'ACCOUNT'
  | 'PROFILE'
  | 'SECURITY'
  | 'BOOKING'
  | 'STAY'
  | 'MESSAGING'
  | 'HOSTING'
  | 'LISTING'
  | 'PAYMENT'
  | 'REVIEW'
  | 'SYSTEM';

export interface NotificationRow {
  id: string;
  user_id: string;
  category: NotificationCategory;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  title: string;
  message: string;
  action_path: string | null;
  source_event_id: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPayload {
  recipientId: string;
  category: NotificationCategory;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  title: string;
  message: string;
  actionPath?: string;
  sourceEventId: string;
}
