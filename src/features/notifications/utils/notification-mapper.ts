import { type NotificationRow } from '../types';
import {
  type NotificationViewModel,
  type NotificationGroup,
  NotificationType,
} from '../types';
import { formatNotificationTime } from '@/lib/formatters/time';
import { differenceInHours } from 'date-fns';

export function mapToViewModel(row: NotificationRow): NotificationViewModel {
  let iconName = 'Info';
  let iconColorClass = 'text-slate-500 bg-slate-50';
  let actionLabel = 'View Details';

  switch (row.type) {
    case NotificationType.NEW_MESSAGE:
      iconName = 'MessageCircle';
      iconColorClass = 'text-blue-500 bg-blue-50';
      actionLabel = 'Open Conversation';
      break;
    case NotificationType.HOST_RESPONSE:
      iconName = 'Reply';
      iconColorClass = 'text-purple-500 bg-purple-50';
      actionLabel = 'Open Conversation';
      break;
    case NotificationType.BOOKING_REQUEST:
      iconName = 'CalendarClock';
      iconColorClass = 'text-amber-500 bg-amber-50';
      actionLabel = 'Review Request';
      break;
    case NotificationType.BOOKING_APPROVED:
      iconName = 'CheckCircle2';
      iconColorClass = 'text-green-500 bg-green-50';
      actionLabel = 'View Booking';
      break;
    case NotificationType.BOOKING_REJECTED:
      iconName = 'XCircle';
      iconColorClass = 'text-red-500 bg-red-50';
      actionLabel = 'View Details';
      break;
    case NotificationType.BOOKING_CANCELLED:
      iconName = 'Ban';
      iconColorClass = 'text-slate-500 bg-slate-100';
      actionLabel = 'View Details';
      break;
    case NotificationType.STAY_CHECKED_IN:
      iconName = 'DoorOpen';
      iconColorClass = 'text-emerald-500 bg-emerald-50';
      break;
    case NotificationType.STAY_CHECKED_OUT:
      iconName = 'DoorClosed';
      iconColorClass = 'text-slate-500 bg-slate-50';
      break;
    case NotificationType.REVIEW_REMINDER:
    case NotificationType.REVIEW_RECEIVED:
      iconName = 'Star';
      iconColorClass = 'text-yellow-500 bg-yellow-50';
      actionLabel = 'Read Review';
      break;
    case NotificationType.CALENDAR_SYNC_SUCCESS:
      iconName = 'RefreshCcw';
      iconColorClass = 'text-green-500 bg-green-50';
      break;
    case NotificationType.CALENDAR_SYNC_FAILED:
      iconName = 'AlertCircle';
      iconColorClass = 'text-red-500 bg-red-50';
      break;
    case NotificationType.SYSTEM:
      iconName = 'Info';
      iconColorClass = 'text-slate-500 bg-slate-50';
      break;
  }

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timeLabel: formatNotificationTime(row.created_at),
    isRead:
      row.read_at !== null && row.read_at !== undefined && row.read_at !== '',
    type: row.type,
    iconName,
    iconColorClass,
    link: row.link,
    actionLabel,
  };
}

export function groupNotificationsByDate(
  rows: NotificationRow[]
): NotificationGroup[] {
  const groups: Record<string, NotificationViewModel[]> = {
    New: [],
    Earlier: [],
  };

  const now = new Date();

  rows.forEach((row) => {
    const date = new Date(row.created_at);
    const viewModel = mapToViewModel(row);

    // If less than 24 hours old, put in New
    const hours = differenceInHours(now, date);

    if (hours < 24) {
      groups['New'].push(viewModel);
    } else {
      groups['Earlier'].push(viewModel);
    }
  });

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([title, items]) => ({ title, items }));
}
