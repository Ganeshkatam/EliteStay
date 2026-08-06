import {
  differenceInMinutes,
  differenceInHours,
  isToday,
  isYesterday,
  format,
  isThisYear,
  isThisWeek,
} from 'date-fns';

export function formatNotificationTime(dateString: string | Date): string {
  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();

  const mins = differenceInMinutes(now, date);

  if (mins < 1) {
    return 'Just now';
  }

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hours = differenceInHours(now, date);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d, h:mm a'); // e.g. "Aug 4, 3:23 AM"
  }

  return format(date, 'MMM d, yyyy'); // e.g. "Aug 4, 2025"
}
