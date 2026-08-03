'use client';

/*
==================================================
Domain: Host Shared Module - Components
Purpose: Reusable lifecycle status pill badge serving across Bookings and Stays operational workflows.
==================================================
*/

import React from 'react';

export type StatusColorVariant =
  'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusColorVariant;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({
  label,
  variant = 'default',
  className = '',
  icon,
}: StatusBadgeProps) {
  const getVariantStyles = (v: StatusColorVariant) => {
    switch (v) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'danger':
        return 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'neutral':
        return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'default':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getVariantStyles(
        variant
      )} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
}
