import { type NotificationViewModel } from '../types';
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
  notification: NotificationViewModel;
  onMarkRead?: (id: string) => void;
}

export function NotificationRow({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const isRead = notification.isRead;

  const iconMap = {
    MessageCircle,
    CalendarClock,
    CalendarCheck,
    CalendarX,
    CalendarMinus,
    Reply,
    RefreshCcw,
    AlertCircle,
    Star,
    CheckCircle,
    LogOut,
    Info,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as Record<string, any>;

  const IconComponent = iconMap[notification.iconName] || Info;

  const iconColor = notification.iconColorClass;
  const timeString = notification.timeLabel;

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

        {(notification.actionPath || notification.link) && (
          <div className="mt-3 flex items-center text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
            {notification.actionLabel || 'View Details'}
            <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        )}
      </div>

      {!isRead && (
        <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
      )}
    </div>
  );

  const href =
    notification.actionPath ||
    notification.link ||
    `/users/notifications/${notification.id}`;
  return (
    <Link href={href} className="block">
      {Content}
    </Link>
  );
}
