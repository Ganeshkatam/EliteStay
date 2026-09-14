'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as NotificationService from '../actions/notification.actions';
import { type NotificationRow } from '../types';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    NotificationService.getMyNotifications().then((data) =>
      setNotifications(data)
    );

    // Realtime subscription
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as NotificationRow;
            setNotifications((prev) => [newNotif, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = getUserId();

    return () => {
      unsubscribe.then((fn) => fn && fn());
    };
  }, [supabase]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = async () => {
    await NotificationService.markAllRead();
    setNotifications(
      notifications.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const handleNotificationClick = async (id: string, read: boolean) => {
    if (!read) {
      await NotificationService.markRead(id);
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 5).map((notification) => (
                <Link
                  href={
                    notification.action_path ||
                    `/users/notifications/${notification.id}`
                  }
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      !!notification.read_at
                    )
                  }
                  key={notification.id}
                  className={`p-4 border-b border-slate-50 flex flex-col gap-1 transition-colors ${!notification.read_at ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className={`text-sm ${!notification.read_at ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDistanceToNowStrict(
                        new Date(notification.created_at),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notification.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Link
            href="/users/notifications"
            onClick={() => setOpen(false)}
            className="block w-full text-center text-sm text-slate-900 font-semibold hover:text-slate-700"
          >
            View All &rarr;
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
