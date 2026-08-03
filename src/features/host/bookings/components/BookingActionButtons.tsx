'use client';

/*
==================================================
Domain: Host Booking Operations - Components
Purpose: Renders domain-validated dynamic action buttons and handles asynchronous execution with Server Actions.
==================================================
*/

import React, { useState } from 'react';
import { Loader2, Check, X, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BookingAction } from '../types/booking.types';
import { executeBookingAction } from '../actions/booking.actions';

interface BookingActionButtonsProps {
  bookingId: string;
  actions: BookingAction[];
  onActionComplete?: () => void;
}

export function BookingActionButtons({
  bookingId,
  actions,
  onActionComplete,
}: BookingActionButtonsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!actions || actions.length === 0) {
    return null;
  }

  const handleActionClick = async (actionId: string) => {
    setErrorMsg(null);
    setLoadingId(actionId);

    try {
      const result = await executeBookingAction(bookingId, actionId);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
      } else {
        if (onActionComplete) {
          onActionComplete();
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to execute action.'
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getButtonIcon = (actionId: string, isLoading: boolean) => {
    if (isLoading) return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    if (actionId === 'approve')
      return <Check className="w-4 h-4 mr-2 text-emerald-100" />;
    if (actionId === 'reject') return <X className="w-4 h-4 mr-2" />;
    if (actionId === 'reschedule') return <Calendar className="w-4 h-4 mr-2" />;
    return <ArrowRight className="w-4 h-4 mr-2" />;
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-3 justify-end">
        {actions.map((action) => {
          const isLoading = loadingId === action.id;
          const isOtherLoading = loadingId !== null && !isLoading;

          const buttonVariant =
            action.variant === 'primary'
              ? 'default'
              : action.variant === 'danger'
                ? 'destructive'
                : action.variant === 'secondary'
                  ? 'secondary'
                  : 'outline';

          return (
            <Button
              key={action.id}
              variant={buttonVariant}
              size="sm"
              disabled={!action.enabled || isLoading || isOtherLoading}
              onClick={() => handleActionClick(action.id)}
              title={action.reasonDisabled || action.label}
              className="font-medium px-4 shadow-sm"
            >
              {getButtonIcon(action.id, isLoading)}
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>
      {errorMsg && (
        <p className="text-xs text-rose-500 font-medium text-right mt-1 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded border border-rose-200 dark:border-rose-900">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
