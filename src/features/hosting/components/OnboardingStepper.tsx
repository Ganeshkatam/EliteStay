import React from 'react';
import { OnboardingStep } from '../types/hosting.types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
  steps: OnboardingStep[];
}

export function OnboardingStepper({ steps }: OnboardingStepperProps) {
  const visualSteps = steps;

  return (
    <div className="w-full py-6 border-b border-slate-200 bg-white mb-8 transition-all duration-300">
      <div className="max-w-3xl mx-auto px-6 sm:px-12">
        <div className="flex items-center justify-between gap-4">
          {visualSteps.map((step, index) => {
            const isCompleted = step.isCompleted;
            const isCurrent = step.isCurrent;

            return (
              <div
                key={step.id}
                className="flex items-center gap-2 group flex-1 last:flex-none"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 shrink-0 transition-all duration-300',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : isCurrent
                        ? 'border-rose-500 text-rose-600 bg-rose-50 ring-4 ring-rose-500/15 animate-pulse'
                        : 'border-slate-300 text-slate-400 bg-white'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold whitespace-nowrap hidden sm:block transition-colors duration-200',
                    isCompleted
                      ? 'text-slate-800'
                      : isCurrent
                        ? 'text-slate-900 font-bold'
                        : 'text-slate-400'
                  )}
                >
                  {step.title}
                </span>

                {/* Connecting Line */}
                {index < visualSteps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-full mx-4 sm:mx-2 hidden sm:block transition-all duration-500 rounded-full',
                      isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
