'use client';

import { useState, useMemo } from 'react';
import { type NotificationRow } from '../types';
import { NotificationFilter } from '../types';
import { groupNotificationsByDate } from '../utils/notification-mapper';
import { NotificationHeader } from './NotificationHeader';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationTimeline } from './NotificationTimeline';
import * as NotificationService from '../actions/notification-actions';

interface NotificationWorkspaceProps {
  initialNotifications: NotificationRow[];
}

export function NotificationWorkspace({ initialNotifications }: NotificationWorkspaceProps) {
  const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications);
  const [filter, setFilter] = useState<NotificationFilter>(NotificationFilter.ALL);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // In a real V2, we would setup the Supabase realtime subscription here 
  // exactly like we did in NotificationBell, but for V1 we rely on initial data and local optimistic updates.

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (filter === NotificationFilter.UNREAD) {
      filtered = notifications.filter(n => !n.read_at);
    }
    // For V2: add logic for MESSAGES, BOOKINGS, SYSTEM based on notification.type
    return filtered;
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    await NotificationService.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setIsMarkingRead(false);
  };

  const handleMarkRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    await NotificationService.markRead(id);
  };

  return (
    <div className="w-full">
      <NotificationHeader 
        filter={filter}
        unreadCount={unreadCount}
        isMarkingRead={isMarkingRead}
        onFilterChange={setFilter}
        onMarkAllRead={handleMarkAllRead}
      />
      
      {grouped.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <NotificationTimeline 
          groups={grouped} 
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
