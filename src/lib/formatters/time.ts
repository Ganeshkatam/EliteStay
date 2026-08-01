import { differenceInMinutes, differenceInHours, isToday, isYesterday, format, isThisYear, isThisWeek } from 'date-fns';

export function formatNotificationTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();

  const mins = differenceInMinutes(now, date);
  
  if (mins < 1) {
    return 'Just now';
  }
  
  if (mins < 60) {
    return `${mins}m`;
  }

  const hours = differenceInHours(now, date);
  if (hours < 24 && isToday(date)) {
    return `${hours}h`;
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // e.g. "Monday"
  }

  if (isThisYear(date)) {
    return format(date, 'd MMM'); // e.g. "12 Aug"
  }

  return format(date, 'MMM yyyy'); // e.g. "Aug 2025"
}
