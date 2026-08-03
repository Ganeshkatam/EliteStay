'use client';

/*
==================================================
Domain: Host Shared Module - Components
Purpose: Reusable guest summary card designed specifically for Phase 7 (Bookings) and guest operational workflows.
==================================================
*/

import React from 'react';
import Image from 'next/image';
import { User, Mail, Phone } from 'lucide-react';
import { type GuestSummary } from '../types/summary.types';

interface GuestSummaryCardProps {
  guest: GuestSummary;
  className?: string;
}

export function GuestSummaryCard({
  guest,
  className = '',
}: GuestSummaryCardProps) {
  return (
    <div
      className={`bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3.5 shadow-sm ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-base">
        {guest.avatarUrl ? (
          <Image
            src={guest.avatarUrl}
            alt={guest.fullName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {guest.fullName}
        </h4>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
          {guest.email && (
            <div className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>{guest.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
