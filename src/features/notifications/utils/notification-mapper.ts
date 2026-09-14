import { NotificationRow } from '../domain/notification.types';
import { NotificationViewModel, NotificationGroup } from '../types';
import { formatNotificationTime } from '@/lib/formatters/time';
import { differenceInHours } from 'date-fns';

export function mapToViewModel(row: NotificationRow): NotificationViewModel {
  let iconName = 'Info';
  let iconColorClass = 'text-slate-500 bg-slate-50';
  let actionLabel = 'View Details';

  switch (row.category) {
    case 'PROFILE':
      iconName = 'UserCircle';
      iconColorClass = 'text-blue-500 bg-blue-50';
      actionLabel = 'View Profile';
      break;
    case 'SECURITY':
      iconName = 'ShieldCheck';
      iconColorClass = 'text-emerald-500 bg-emerald-50';
      actionLabel = 'Security Settings';
      break;
    case 'MESSAGING':
      iconName = 'MessageCircle';
      iconColorClass = 'text-blue-500 bg-blue-50';
      actionLabel = 'Open Conversation';
      break;
    case 'BOOKING':
      iconName = 'CalendarClock';
      if (row.event_type.includes('APPROVED')) {
        iconName = 'CheckCircle2';
        iconColorClass = 'text-green-500 bg-green-50';
      } else if (
        row.event_type.includes('DECLINED') ||
        row.event_type.includes('CANCELLED')
      ) {
        iconName = 'XCircle';
        iconColorClass = 'text-red-500 bg-red-50';
      } else {
        iconColorClass = 'text-amber-500 bg-amber-50';
        actionLabel = 'Review Request';
      }
      break;
    case 'STAY':
      iconName = 'DoorOpen';
      iconColorClass = 'text-emerald-500 bg-emerald-50';
      break;
    case 'REVIEW':
      iconName = 'Star';
      iconColorClass = 'text-yellow-500 bg-yellow-50';
      actionLabel = 'Read Review';
      break;
    case 'SYSTEM':
    default:
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
    category: row.category,
    eventType: row.event_type,
    iconName,
    iconColorClass,
    actionPath: row.action_path,
    actionLabel: row.action_path ? actionLabel : null,
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
    const vm = mapToViewModel(row);

    if (differenceInHours(now, date) < 24) {
      groups['New'].push(vm);
    } else {
      groups['Earlier'].push(vm);
    }
  });

  return [
    { title: 'New', items: groups['New'] },
    { title: 'Earlier', items: groups['Earlier'] },
  ].filter((g) => g.items.length > 0);
}
