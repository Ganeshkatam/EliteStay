'use client';

/*
==================================================
Domain: Host Stay & Resident Operations - Components
Purpose: Hero KPI header rendering unified Resident Health and occupancy summary counts per Refinement #9.
==================================================
*/

import React from 'react';
import { Users, Key, LogOut, ShieldAlert, Home } from 'lucide-react';
import { type StayWorkspaceSummary } from '../view-models/stay-workspace.viewmodel';

interface StayQueueHeaderProps {
  summary: StayWorkspaceSummary;
  totalCount: number;
}

export function StayQueueHeader({ summary, totalCount }: StayQueueHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden mb-8">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-900/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs uppercase tracking-wider mb-3 border border-indigo-500/30">
            <Home className="w-3.5 h-3.5" />
            <span>Host Operations Platform • Phase 7</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Stay &amp; Resident Operations
          </h1>
          <p className="text-indigo-200 text-sm md:text-base mt-1 max-w-2xl">
            Who is currently living with us, and what requires attention during
            their stay?
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-5 py-3.5 rounded-xl border border-indigo-800/50 shadow-inner flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold block">
              Total Stays Managed
            </span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* KPI Summary Strip per Refinement #9 */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Active Current Residents */}
        <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors rounded-xl p-4 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Residents
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {summary.activeResidents}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            In accommodation
          </span>
        </div>

        {/* Critical / Needs Attention Residents */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            summary.criticalResidents > 0
              ? 'bg-rose-950/40 border-rose-800/80 hover:bg-rose-950/60'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                summary.criticalResidents > 0
                  ? 'text-rose-300'
                  : 'text-slate-400'
              }`}
            >
              Critical Health
            </span>
            <ShieldAlert
              className={`w-4 h-4 ${
                summary.criticalResidents > 0
                  ? 'text-rose-400 animate-bounce'
                  : 'text-slate-500'
              }`}
            />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {summary.criticalResidents}
          </div>
          <span
            className={`text-xs mt-1 block ${
              summary.criticalResidents > 0 ? 'text-rose-300' : 'text-slate-400'
            }`}
          >
            {summary.criticalResidents > 0
              ? 'Immediate action required'
              : 'All residents healthy'}
          </span>
        </div>

        {/* Today's Check-ins */}
        <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors rounded-xl p-4 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Check-ins Today
            </span>
            <Key className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {summary.checkInsToday}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Awaiting arrival check-in
          </span>
        </div>

        {/* Upcoming Departures */}
        <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors rounded-xl p-4 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Departures This Week
            </span>
            <LogOut className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {summary.departuresThisWeek}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.departuresToday > 0
              ? `${summary.departuresToday} leaving today`
              : 'Scheduled check-outs'}
          </span>
        </div>
      </div>
    </div>
  );
}
