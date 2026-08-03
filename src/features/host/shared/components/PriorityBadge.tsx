'use client';

/*
==================================================
Domain: Host Shared Module - Components
Purpose: Reusable severity and priority badge component serving Bookings, Stays, and future operational workspaces.
==================================================
*/

import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export type OperationalSeverity =
  'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'NONE' | string;

interface PriorityBadgeProps {
  severity: unknown;
  label?: string;
  className?: string;
  animateCritical?: boolean;
}

export function PriorityBadge({
  severity,
  label,
  className = '',
  animateCritical = true,
}: PriorityBadgeProps) {
  const upper = String(severity || 'NONE').toUpperCase();

  if (upper === 'CRITICAL') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-200 dark:border-rose-800 ${
          animateCritical ? 'animate-pulse' : ''
        } ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <span>{label || 'Critical Priority'}</span>
      </span>
    );
  }

  if (upper === 'HIGH') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider border border-amber-200 dark:border-amber-800 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>{label || 'High Priority'}</span>
      </span>
    );
  }

  if (upper === 'NORMAL') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 font-semibold text-xs uppercase tracking-wider border border-sky-200 dark:border-sky-800 ${className}`}
      >
        <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
        <span>{label || 'Normal Priority'}</span>
      </span>
    );
  }

  if (upper === 'LOW') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <span>{label || 'Low Priority'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium text-xs uppercase tracking-wider ${className}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <span>{label || 'Resolved / Closed'}</span>
    </span>
  );
}
