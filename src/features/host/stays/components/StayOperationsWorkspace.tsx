'use client';

/*
==================================================
Domain: Host Stay & Resident Operations - Components
Purpose: Master container component rendering KPI header, dynamic queue switcher, and residency cards per Operational Workspace Rule.
==================================================
*/

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { type StayWorkspaceViewModel } from '../view-models/stay-workspace.viewmodel';
import { StayQueueHeader } from './StayQueueHeader';
import { StayQueueTabs } from './StayQueueTabs';
import { OperationalStayCard } from './OperationalStayCard';

interface StayOperationsWorkspaceProps {
  viewModel: StayWorkspaceViewModel;
}

export function StayOperationsWorkspace({
  viewModel,
}: StayOperationsWorkspaceProps) {
  const { summary, queues, activeQueue, cards, totalStaysCount } = viewModel;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero KPI Summary Header per Refinement #9 */}
      <StayQueueHeader summary={summary} totalCount={totalStaysCount} />

      {/* Urgency-Ordered Operational Queue Navigation Tabs */}
      <StayQueueTabs queues={queues} activeQueue={activeQueue} />

      {/* Main Workspace Content Grid / Empty State */}
      {cards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            No Resident Actions Required in this Queue
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            There are currently no stays or resident operations assigned to this
            operational queue. Select another queue tab above to manage ongoing
            tenancies or review historical archives.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Showing {cards.length} Stays in Selected Queue</span>
            <span className="text-slate-500">
              Sorted by Urgency &amp; SLA Date
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {cards.map((card) => (
              <OperationalStayCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
