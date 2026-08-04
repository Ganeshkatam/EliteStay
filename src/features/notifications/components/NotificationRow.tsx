import { type NotificationRow } from '../types';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  MessageCircle,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarMinus,
  Reply,
  RefreshCcw,
  AlertCircle,
  Info,
  ChevronRight,
  Star,
  CheckCircle,
  LogOut,
} from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationRow;
  onMarkRead?: (id: string) => void;
}

export function NotificationRow({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const isRead = !!notification.read_at;

  const IconComponent =
    {
      NEW_MESSAGE: MessageCircle,
      BOOKING_REQUEST: CalendarClock,
      BOOKING_APPROVED: CalendarCheck,
      BOOKING_REJECTED: CalendarX,
      BOOKING_CANCELLED: CalendarMinus,
      HOST_RESPONSE: Reply,
      CALENDAR_SYNC_SUCCESS: RefreshCcw,
      CALENDAR_SYNC_FAILED: AlertCircle,
      REVIEW_RECEIVED: Star,
      REVIEW_REMINDER: Star,
      STAY_CHECKED_IN: CheckCircle,
      STAY_CHECKED_OUT: LogOut,
      SYSTEM: Info,
    }[notification.type] || Info;

  const iconColor =
    {
      NEW_MESSAGE: 'text-blue-500 bg-blue-50',
      BOOKING_REQUEST: 'text-amber-500 bg-amber-50',
      BOOKING_APPROVED: 'text-green-500 bg-green-50',
      BOOKING_REJECTED: 'text-red-500 bg-red-50',
      BOOKING_CANCELLED: 'text-slate-500 bg-slate-50',
      HOST_RESPONSE: 'text-purple-500 bg-purple-50',
      CALENDAR_SYNC_SUCCESS: 'text-green-500 bg-green-50',
      CALENDAR_SYNC_FAILED: 'text-red-500 bg-red-50',
      REVIEW_RECEIVED: 'text-amber-500 bg-amber-50',
      REVIEW_REMINDER: 'text-amber-500 bg-amber-50',
      STAY_CHECKED_IN: 'text-green-500 bg-green-50',
      STAY_CHECKED_OUT: 'text-slate-500 bg-slate-50',
      SYSTEM: 'text-slate-500 bg-slate-50',
    }[notification.type] || 'text-slate-500 bg-slate-50';

  const createdDate = notification.created_at
    ? new Date(notification.created_at)
    : new Date();
  const timeString = !isNaN(createdDate.getTime())
    ? formatDistanceToNowStrict(createdDate, { addSuffix: true })
    : '';

  const Content = (
    <div
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl transition-all duration-200 border',
        isRead
          ? 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
          : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/60'
      )}
      onClick={() => {
        if (!isRead && onMarkRead) {
          onMarkRead(notification.id);
        }
      }}
    >
      <div className={cn('p-2 rounded-full shrink-0', iconColor)}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4
            className={cn(
              'text-sm font-semibold truncate',
              isRead ? 'text-slate-700' : 'text-slate-900'
            )}
          >
            {notification.title}
          </h4>
          <span
            className={cn(
              'text-xs whitespace-nowrap',
              isRead ? 'text-slate-400' : 'text-blue-600 font-medium'
            )}
          >
            {timeString}
          </span>
        </div>

        <p
          className={cn(
            'text-sm leading-snug line-clamp-2',
            isRead ? 'text-slate-500' : 'text-slate-700'
          )}
        >
          {notification.message}
        </p>

        {notification.link && (
          <div className="mt-3 flex items-center text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
            {getLinkText(notification.type)}{' '}
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        )}
      </div>

      {!isRead && (
        <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {Content}
      </Link>
    );
  }

  return (
    <Link href={`/users/notifications/${notification.id}`} className="block">
      {Content}
    </Link>
  );
}

function getLinkText(type: string): string {
  switch (type) {
    case 'NEW_MESSAGE':
    case 'HOST_RESPONSE':
      return 'Open Conversation';
    case 'BOOKING_REQUEST':
    case 'BOOKING_APPROVED':
    case 'BOOKING_REJECTED':
    case 'BOOKING_CANCELLED':
      return 'View Booking';
    default:
      return 'View Details';
  }
}
