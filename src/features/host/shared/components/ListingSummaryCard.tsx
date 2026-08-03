'use client';

/*
==================================================
Domain: Host Shared Module - Components
Purpose: Reusable accommodation listing presentation card used across Bookings and Stays workspaces.
==================================================
*/

import React from 'react';
import { Home, MapPin } from 'lucide-react';
import { type ListingSummary } from '../types/summary.types';

interface ListingSummaryCardProps {
  listing: ListingSummary;
  className?: string;
}

export function ListingSummaryCard({
  listing,
  className = '',
}: ListingSummaryCardProps) {
  return (
    <div
      className={`bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">
          {listing.city || 'Property Accommodations'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Home className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
          {listing.title}
        </h4>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-slate-400 block font-normal">Monthly Rent</span>
          <span className="font-bold text-slate-800 dark:text-white">
            ₹{listing.monthlyRent.toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block font-normal">
            Security Deposit
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            ₹{listing.securityDeposit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
