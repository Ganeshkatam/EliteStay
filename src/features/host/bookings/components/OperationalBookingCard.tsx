'use client';

/*
==================================================
Domain: Host Booking Operations - Components
Purpose: Reusable operational booking card rendering domain priority badges, SLA countdown formatting, and actions.
==================================================
*/

import React from 'react';
import { Calendar, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '@/features/host/shared';
import { type BookingCardViewModel } from '../view-models/booking-card.viewmodel';
import { BookingPriority } from '../types/booking.types';
import { BookingActionButtons } from './BookingActionButtons';

interface OperationalBookingCardProps {
  card: BookingCardViewModel;
  onRefresh?: () => void;
}

export function OperationalBookingCard({
  card,
  onRefresh,
}: OperationalBookingCardProps) {
  // Map raw attentionDeadline timestamp to human-readable SLA string in UI
  const formatDeadline = (deadlineIso: string | null) => {
    if (!deadlineIso || card.priority === BookingPriority.NONE) return null;
    const now = new Date();
    const deadline = new Date(deadlineIso);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return 'Overdue / Immediate action required';
    }
    if (diffHours <= 24) {
      return 'Deadline: Today (within 24 hours)';
    }
    if (diffHours <= 48) {
      return 'Deadline: Tomorrow';
    }
    const days = Math.ceil(diffHours / 24);
    return `Deadline in ${days} days`;
  };

  const deadlineLabel = formatDeadline(card.attentionDeadline);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4 ${
        card.priority === BookingPriority.CRITICAL
          ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
          : card.priority === BookingPriority.HIGH
            ? 'border-amber-200 dark:border-amber-900/60'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Header: Priority Badge + SLA Deadline + Lifecycle State Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <PriorityBadge
            severity={card.priority}
            label={
              card.priority === BookingPriority.CRITICAL
                ? 'Critical SLA'
                : undefined
            }
          />
          {deadlineLabel && (
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${
                card.priority === BookingPriority.CRITICAL
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {deadlineLabel}
            </span>
          )}
        </div>
        <StatusBadge
          label={`State: ${card.lifecycleState}`}
          variant="neutral"
        />
      </div>

      {/* Main Content: Guest & Listing Details + Financials Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Resident & Accommodation info */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>{card.listing.city || 'Accommodation Property'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {card.listing.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">{card.guest.fullName}</span>
              {card.guest.email && (
                <span className="text-xs text-slate-500">
                  ({card.guest.email})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 font-medium">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                Move-in: <strong>{card.requestedMoveIn}</strong>
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded text-indigo-800 dark:text-indigo-200">
                {card.requestedDuration}{' '}
                {card.requestedDuration === 1 ? 'Month' : 'Months'}
              </span>
            </div>
          </div>

          {card.message && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 flex gap-2 items-start">
              <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="italic line-clamp-2">
                &ldquo;{card.message}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Financial Snapshot Box */}
        <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
            Financial Terms Snapshot
          </span>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Monthly Rent:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{card.financials.monthlyRent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Security Deposit:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{card.financials.securityDeposit.toLocaleString()}
              </span>
            </div>
            {card.financials.maintenanceFee > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Maintenance:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  ₹{card.financials.maintenanceFee.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      {card.actions && card.actions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <BookingActionButtons
            bookingId={card.id}
            actions={card.actions}
            onActionComplete={onRefresh}
          />
        </div>
      )}
    </div>
  );
}
