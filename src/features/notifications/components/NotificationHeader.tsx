import { NotificationFilter } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface NotificationHeaderProps {
  filter: NotificationFilter;
  unreadCount: number;
  isMarkingRead: boolean;
  onFilterChange: (filter: NotificationFilter) => void;
  onMarkAllRead: () => void;
}

export function NotificationHeader({
  filter,
  unreadCount,
  isMarkingRead,
  onFilterChange,
  onMarkAllRead
}: NotificationHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <span className="text-sm font-medium text-slate-500">{unreadCount} unread</span>
        )}
      </div>

      <div className="w-full h-px bg-slate-200 mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onFilterChange(NotificationFilter.ALL)}
            className={cn(
              "text-sm font-medium transition-colors border-b-2 pb-1",
              filter === NotificationFilter.ALL 
                ? "text-slate-900 border-slate-900" 
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange(NotificationFilter.UNREAD)}
            className={cn(
              "text-sm font-medium transition-colors border-b-2 pb-1",
              filter === NotificationFilter.UNREAD 
                ? "text-slate-900 border-slate-900" 
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            Unread
          </button>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllRead}
            disabled={isMarkingRead}
            className="text-slate-500 hover:text-slate-900"
          >
            {isMarkingRead ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Mark all read
          </Button>
        )}
      </div>
    </div>
  );
}
