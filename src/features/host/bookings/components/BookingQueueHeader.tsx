'use client';

/*
==================================================
Domain: Host Booking Operations - Components
Purpose: Summary banner rendering pre-computed operational KPIs and priority breakdown without inline calculations.
==================================================
*/

import React from 'react';
import {
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { type BookingWorkspaceSummary } from '../view-models/booking-workspace.viewmodel';

interface BookingQueueHeaderProps {
  summary: BookingWorkspaceSummary;
}

export function BookingQueueHeader({ summary }: BookingQueueHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-700/50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-1">
            <Zap className="h-4 w-4" />
            <span>Host Operational Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Booking Operations Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Prioritize action items, monitor move-in readiness, and orchestrate
            seamless resident accommodation workflows.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Needs Attention Card */}
        <div className="bg-slate-800/80 rounded-xl p-5 border border-amber-500/30 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                Needs Attention
              </span>
              <span className="text-3xl font-extrabold text-white">
                {summary.attention}
              </span>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Priority Breakdown Pill Section */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
            {summary.attention === 0 ? (
              <span className="text-slate-400 font-medium">
                All action items resolved
              </span>
            ) : (
              <>
                {summary.criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {summary.criticalCount} Critical
                  </span>
                )}
                {summary.highCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                    {summary.highCount} High
                  </span>
                )}
                {summary.normalCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                    {summary.normalCount} Normal
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 2. Today's Move-ins Card */}
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Today&apos;s Move-ins
              </span>
              <span className="text-3xl font-extrabold text-white">
                {summary.todayMoveIns}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
            {summary.todayMoveIns === 0
              ? 'No arrivals scheduled for today'
              : 'Ready for resident check-in'}
          </div>
        </div>

        {/* 3. Upcoming Stays Card */}
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Upcoming Stays
              </span>
              <span className="text-3xl font-extrabold text-white">
                {summary.upcoming}
              </span>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
            Future confirmed reservations
          </div>
        </div>

        {/* 4. Closed / Completed Card */}
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Closed
              </span>
              <span className="text-3xl font-extrabold text-slate-300">
                {summary.closed}
              </span>
            </div>
            <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
            Resolved, expired, or completed
          </div>
        </div>
      </div>
    </div>
  );
}
