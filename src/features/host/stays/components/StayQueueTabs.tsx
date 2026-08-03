'use client';

/*
==================================================
Domain: Host Stay & Resident Operations - Components
Purpose: Navigation tab switcher rendering urgency-ordered queues with priority indicators.
==================================================
*/

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  type StayQueueDefinition,
  StayPriority,
  type StayQueueType,
} from '../types/stay.types';

interface StayQueueTabsProps {
  queues: StayQueueDefinition[];
  activeQueue: StayQueueType;
}

export function StayQueueTabs({ queues, activeQueue }: StayQueueTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectQueue = (queueId: StayQueueType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('queue', queueId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderPriorityDot = (priority: StayPriority, count: number) => {
    if (count === 0) return null;
    if (priority === StayPriority.CRITICAL) {
      return (
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
      );
    }
    if (priority === StayPriority.HIGH) {
      return (
        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      );
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
      {queues.map((q) => {
        const isActive = q.id === activeQueue;

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => handleSelectQueue(q.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {renderPriorityDot(q.priority, q.count)}
            <span>{q.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                isActive
                  ? 'bg-indigo-700 text-indigo-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {q.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
