import { type NotificationRow } from '../types';
import { type NotificationViewModel, type NotificationGroup, NotificationType } from '../types';
import { formatNotificationTime } from '@/lib/formatters/time';
import { isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

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
      actionLabel = 'View Booking';
      break;
    case NotificationType.BOOKING_APPROVED:
      iconName = 'CalendarCheck';
      iconColorClass = 'text-green-500 bg-green-50';
      actionLabel = 'View Booking';
      break;
    case NotificationType.BOOKING_REJECTED:
      iconName = 'CalendarX';
      iconColorClass = 'text-red-500 bg-red-50';
      actionLabel = 'View Booking';
      break;
    case NotificationType.BOOKING_CANCELLED:
      iconName = 'CalendarMinus';
      iconColorClass = 'text-slate-500 bg-slate-50';
      actionLabel = 'View Booking';
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
    isRead: !!row.read_at,
    type: row.type,
    iconName,
    iconColorClass,
    link: row.link,
    actionLabel,
  };
}

export function groupNotificationsByDate(rows: NotificationRow[]): NotificationGroup[] {
  const groups: Record<string, NotificationViewModel[]> = {
    'Today': [],
    'Yesterday': [],
    'Earlier This Week': [],
    'Earlier This Month': [],
    'Older': []
  };

  rows.forEach(row => {
    const date = new Date(row.created_at);
    const vm = mapToViewModel(row);
    
    if (isToday(date)) {
      groups['Today'].push(vm);
    } else if (isYesterday(date)) {
      groups['Yesterday'].push(vm);
    } else if (isThisWeek(date)) {
      groups['Earlier This Week'].push(vm);
    } else if (isThisMonth(date)) {
      groups['Earlier This Month'].push(vm);
    } else {
      groups['Older'].push(vm);
    }
  });

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([title, items]) => ({ title, items }));
}
