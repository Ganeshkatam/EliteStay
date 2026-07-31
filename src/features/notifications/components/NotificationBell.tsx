'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMyNotifications, markAllAsRead, markAsRead } from '../actions/notificationActions';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notification = any;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only fetch on open or mount
    getMyNotifications().then(data => setNotifications(data));
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
  };

  const handleNotificationClick = async (id: string, read: boolean) => {
    if (!read) {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-50 flex flex-col gap-1 transition-colors ${!notification.read_at ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm ${!notification.read_at ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <Link 
                      href={notification.link}
                      onClick={() => handleNotificationClick(notification.id, !!notification.read_at)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1 inline-block"
                    >
                      View details &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
