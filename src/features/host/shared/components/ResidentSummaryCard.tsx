'use client';

/*
==================================================
Domain: Host Shared Module - Components
Purpose: Reusable resident occupancy card designed specifically for Phase 7 (Stays) and resident operational workflows.
==================================================
*/

import Image from 'next/image';
import { User, Calendar, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { type ResidentSummary } from '../types/summary.types';

interface ResidentSummaryCardProps {
  resident: ResidentSummary;
  className?: string;
}

export function ResidentSummaryCard({
  resident,
  className = '',
}: ResidentSummaryCardProps) {
  const renderOccupancyBadge = () => {
    switch (resident.occupancyState) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Active Resident
          </span>
        );
      case 'CHECKING_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 text-xs font-semibold border border-sky-200 dark:border-sky-800">
            <Key className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Check-in Pending
          </span>
        );
      case 'CHECKING_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Move-out Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
            Former Resident
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 flex-shrink-0">
            {resident.avatarUrl ? (
              <Image
                src={resident.avatarUrl}
                alt={resident.fullName}
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-full"
                unoptimized
              />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {resident.fullName}
            </h4>
            {resident.listingTitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {resident.listingTitle}{' '}
                {resident.roomOrUnitNumber
                  ? `• Unit/Room ${resident.roomOrUnitNumber}`
                  : ''}
              </p>
            )}
          </div>
        </div>

        {renderOccupancyBadge()}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
        {resident.moveInDate && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>
              In:{' '}
              <strong className="text-slate-900 dark:text-white">
                {resident.moveInDate}
              </strong>
            </span>
          </div>
        )}
        {resident.moveOutDate ? (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              Out:{' '}
              <strong className="text-slate-900 dark:text-white">
                {resident.moveOutDate}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Out: Ongoing Stay</span>
          </div>
        )}
      </div>
    </div>
  );
}
