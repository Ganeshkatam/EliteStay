'use client';

/*
==================================================
Domain: Host Booking Operations - Components
Purpose: Dynamic navigation tab switcher driven by QueueDefinition contracts without hardcoded UI tab structure.
==================================================
*/

import React from 'react';
import {
  type QueueDefinition,
  type OperationalQueueType,
  BookingPriority,
} from '../types/booking.types';

interface BookingQueueTabsProps {
  queues: QueueDefinition[];
  activeQueue: OperationalQueueType;
  onSelectQueue: (queueId: OperationalQueueType) => void;
}

export function BookingQueueTabs({
  queues,
  activeQueue,
  onSelectQueue,
}: BookingQueueTabsProps) {
  const getBadgeStyle = (priority: BookingPriority, isActive: boolean) => {
    if (priority === BookingPriority.CRITICAL) {
      return isActive
        ? 'bg-rose-600 text-white'
        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    }
    if (priority === BookingPriority.HIGH) {
      return isActive
        ? 'bg-amber-600 text-white'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    }
    if (priority === BookingPriority.NORMAL) {
      return isActive
        ? 'bg-sky-600 text-white'
        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300';
    }
    return isActive
      ? 'bg-slate-600 text-white'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="border-b border-gray-200 dark:border-slate-800 mb-6">
      <nav
        className="flex space-x-2 sm:space-x-8 -mb-px overflow-x-auto py-1"
        aria-label="Operational Queues"
      >
        {queues.map((queue) => {
          const isActive = queue.id === activeQueue;
          return (
            <button
              key={queue.id}
              onClick={() => onSelectQueue(queue.id)}
              className={`whitespace-nowrap pb-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>{queue.label}</span>
              <span
                className={`ml-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle(
                  queue.priority,
                  isActive
                )}`}
              >
                {queue.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
