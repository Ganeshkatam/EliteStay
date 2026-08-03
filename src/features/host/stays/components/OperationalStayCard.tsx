'use client';

/*
==================================================
Domain: Host Stay & Resident Operations - Components
Purpose: Reusable operational stay card incorporating shared Resident Summary and itemized Resident Health metrics.
==================================================
*/

import React from 'react';
import {
  Clock,
  Activity,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Calendar,
} from 'lucide-react';
import {
  PriorityBadge,
  StatusBadge,
  ResidentSummaryCard,
  ListingSummaryCard,
} from '@/features/host/shared';
import { type StayCardViewModel } from '../view-models/stay-card.viewmodel';
import { StayPriority } from '../types/stay.types';
import { StayActionButtons } from './StayActionButtons';

interface OperationalStayCardProps {
  card: StayCardViewModel;
}

export function OperationalStayCard({ card }: OperationalStayCardProps) {
  const renderHealthBadge = (overall: string) => {
    switch (overall) {
      case 'CRITICAL':
        return <StatusBadge label="Health: CRITICAL" variant="danger" />;
      case 'NEEDS_ATTENTION':
        return (
          <StatusBadge label="Health: Needs Attention" variant="warning" />
        );
      case 'GOOD':
        return <StatusBadge label="Health: Good" variant="info" />;
      case 'EXCELLENT':
      default:
        return <StatusBadge label="Health: Excellent" variant="success" />;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
        card.priority === StayPriority.CRITICAL
          ? 'border-rose-300 dark:border-rose-900 ring-2 ring-rose-500/10'
          : card.priority === StayPriority.HIGH
            ? 'border-amber-300 dark:border-amber-900/80'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Header: Priority Badge + Attention Deadline + Stay Lifecycle Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <PriorityBadge
            severity={card.priority}
            label={
              card.priority === StayPriority.CRITICAL
                ? 'Critical SLA'
                : undefined
            }
          />
          {card.attentionDeadline && (
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                card.priority === StayPriority.CRITICAL
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>SLA Target: {card.attentionDeadline}</span>
            </span>
          )}
        </div>
        <StatusBadge label={`Stay: ${card.lifecycleState}`} variant="neutral" />
      </div>

      {/* Main Grid: Shared Resident Summary + Property Accommodation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
        {/* Left Column (7 cols): Resident Identity & Occupancy from shared module */}
        <div className="lg:col-span-7">
          <ResidentSummaryCard resident={card.resident} />
        </div>

        {/* Right Column (5 cols): Accommodation Property summary from shared module */}
        <div className="lg:col-span-5">
          <ListingSummaryCard listing={card.listing} />
        </div>
      </div>

      {/* Resident Health Section per Refinements #4 & #10 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 mb-6">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Resident Health Diagnostics
            </h5>
          </div>
          {renderHealthBadge(card.health.overall)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                Occupancy
              </span>
              <span className="font-bold truncate block">
                {card.health.occupancy}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                Payments &amp; Billing
              </span>
              <span className="font-bold truncate block">
                {card.health.payments}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                Lease Term
              </span>
              <span className="font-bold truncate block">
                {card.health.lease}
              </span>
            </div>
          </div>
        </div>

        {card.health.actionRequired && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Action Recommended: {card.health.actionRequired}</span>
          </div>
        )}
      </div>

      {/* Footer Controls: Dynamic Server Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-medium">
          Stay Record Ref:{' '}
          <span className="font-mono">{card.id.slice(0, 8)}...</span>
        </div>
        <StayActionButtons
          stayId={card.id}
          currentStatus={card.databaseStatus}
          actions={card.actions}
        />
      </div>
    </div>
  );
}
