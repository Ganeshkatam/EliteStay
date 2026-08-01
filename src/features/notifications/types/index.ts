export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_APPROVED = 'BOOKING_APPROVED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  HOST_RESPONSE = 'HOST_RESPONSE',
  CALENDAR_SYNC_SUCCESS = 'CALENDAR_SYNC_SUCCESS',
  CALENDAR_SYNC_FAILED = 'CALENDAR_SYNC_FAILED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  STAY_CHECKED_IN = 'STAY_CHECKED_IN',
  STAY_CHECKED_OUT = 'STAY_CHECKED_OUT',
  SYSTEM = 'SYSTEM'
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export enum NotificationFilter {
  ALL,
  UNREAD,
  MESSAGES,
  BOOKINGS,
  SYSTEM,
}

export interface NotificationViewModel {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  isRead: boolean;
  type: NotificationType;
  iconName: string;
  iconColorClass: string;
  link: string | null;
  actionLabel: string | null;
}

export interface NotificationGroup {
  title: string;
  items: NotificationViewModel[];
}
