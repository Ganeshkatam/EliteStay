'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingSubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
  fullWidth?: boolean;
}

export function OnboardingSubmitButton({
  label,
  loadingLabel = 'Processing...',
  className,
  fullWidth = false,
}: OnboardingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
        fullWidth && 'w-full',
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
