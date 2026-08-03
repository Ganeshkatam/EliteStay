'use client';

/*
==================================================
Domain: Host Booking Operations - Components
Purpose: Master workspace container adhering to the Operational Workspace Rule (Header -> Summary -> Queue Tabs -> Cards).
==================================================
*/

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { type BookingWorkspaceViewModel } from '../view-models/booking-workspace.viewmodel';
import { type OperationalQueueType } from '../types/booking.types';
import { BookingQueueHeader } from './BookingQueueHeader';
import { BookingQueueTabs } from './BookingQueueTabs';
import { OperationalBookingCard } from './OperationalBookingCard';

interface BookingOperationsWorkspaceProps {
  viewModel: BookingWorkspaceViewModel;
}

export function BookingOperationsWorkspace({
  viewModel,
}: BookingOperationsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleQueueChange = (newQueue: OperationalQueueType) => {
    const url = `${pathname}?queue=${newQueue}`;
    router.push(url, { scroll: false });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header & Summary KPI Banner */}
      <BookingQueueHeader summary={viewModel.summary} />

      {/* 2. Dynamic Operational Queue Tabs */}
      <BookingQueueTabs
        queues={viewModel.queues}
        activeQueue={viewModel.activeQueue}
        onSelectQueue={handleQueueChange}
      />

      {/* 3. Operational Queue Cards Feed */}
      <div className="space-y-4 min-h-[400px]">
        {viewModel.items && viewModel.items.length > 0 ? (
          viewModel.items.map((card) => (
            <OperationalBookingCard
              key={card.id}
              card={card}
              onRefresh={handleRefresh}
            />
          ))
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Queue is empty
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              There are currently no bookings requiring host attention in the
              selected operational queue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
