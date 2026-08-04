import { type NotificationGroup } from '../types';
import { NotificationRow } from './NotificationRow';

interface NotificationTimelineProps {
  groups: NotificationGroup[];
  onMarkRead?: (id: string) => void;
}

export function NotificationTimeline({
  groups,
  onMarkRead,
}: NotificationTimelineProps) {
  return (
    <div className="space-y-8 mt-2">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-sm font-medium text-slate-500 mb-4 px-2">
            {group.title}
          </h3>
          <div className="flex flex-col">
            {group.items.map((notification, index) => (
              <div key={notification.id} className="relative">
                <NotificationRow
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
                {/* Horizontal divider between items, except the last one */}
                {index < group.items.length - 1 && (
                  <div className="absolute bottom-0 left-[3.25rem] right-0 h-px bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
