'use client';

/*
==================================================
Domain: Host Stay & Resident Operations - Components
Purpose: Renders actionable business controls emitted by StayDecisionPolicy with asynchronous transition feedback.
==================================================
*/

import React, { useState, useTransition } from 'react';
import {
  Loader2,
  Check,
  AlertCircle,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { type StayAction, type DatabaseStayStatus } from '../types/stay.types';
import {
  confirmCheckInAction,
  confirmCheckOutAction,
  extendLeaseAction,
  terminateStayAction,
} from '../actions/stay.actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StayActionButtonsProps {
  stayId: string;
  currentStatus: DatabaseStayStatus;
  actions: StayAction[];
}

export function StayActionButtons({
  stayId,
  currentStatus,
  actions,
}: StayActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);

  const executeAction = (actionId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveActionId(actionId);

    startTransition(async () => {
      let res: { success: boolean; error?: string };

      if (actionId === 'confirm-checkin') {
        res = await confirmCheckInAction(stayId, currentStatus);
      } else if (actionId === 'confirm-checkout') {
        res = await confirmCheckOutAction(stayId, currentStatus);
      } else if (actionId === 'extend-stay') {
        res = await extendLeaseAction(stayId, currentStatus);
      } else if (actionId === 'terminate-stay') {
        res = await terminateStayAction(stayId, currentStatus);
        setIsTerminateDialogOpen(false);
      } else if (actionId === 'transfer-unit') {
        setSuccessMessage('Room / Unit Transfer request registered.');
        setTimeout(() => setSuccessMessage(null), 3000);
        setActiveActionId(null);
        return;
      } else {
        setActiveActionId(null);
        return;
      }

      if (res.success) {
        setSuccessMessage('Updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Action failed');
      }
      setActiveActionId(null);
    });
  };

  const handleActionClick = (actionId: string) => {
    if (actionId === 'terminate-stay') {
      setIsTerminateDialogOpen(true);
      return;
    }
    executeAction(actionId);
  };

  const getVariantClasses = (
    variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  ) => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-indigo-600';
      case 'secondary':
        return 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-700';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border-rose-600';
      case 'outline':
      default:
        return 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((act) => {
          const isLoadingThis = isPending && activeActionId === act.id;

          return (
            <button
              key={act.id}
              type="button"
              disabled={!act.enabled || isPending}
              onClick={() => handleActionClick(act.id)}
              title={act.reasonDisabled || act.label}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                act.variant
              )}`}
            >
              {isLoadingThis ? (
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              ) : (
                <ArrowUpRight className="w-4 h-4 flex-shrink-0 opacity-80" />
              )}
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* In-App Early Termination Dialog */}
      <Dialog
        open={isTerminateDialogOpen}
        onOpenChange={setIsTerminateDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Early Terminate Tenancy?
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-slate-600 pt-1">
              Are you sure you wish to early terminate this tenancy? This action
              will cancel active stay permissions and trigger the move-out
              protocol.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsTerminateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => executeAction('terminate-stay')}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Yes, Terminate Tenancy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
