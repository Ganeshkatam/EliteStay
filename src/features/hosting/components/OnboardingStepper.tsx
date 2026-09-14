import React from 'react';
import { OnboardingStep } from '../types/hosting.types';
import { Check } from 'lucide-react';

interface OnboardingStepperProps {
  steps: OnboardingStep[];
}

export function OnboardingStepper({ steps }: OnboardingStepperProps) {
  // Filter out the 'eligibility' step as it's an overview and not part of the active linear flow in the UI.
  const visualSteps = steps.filter((step) => step.id !== 'eligibility');

  return (
    <div className="w-full py-6 border-b border-slate-200 bg-white mb-8">
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
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2 shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent
                        ? 'border-rose-500 text-rose-500 bg-rose-50'
                        : 'border-slate-300 text-slate-400 bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap hidden sm:block ${
                    isCompleted
                      ? 'text-slate-800'
                      : isCurrent
                        ? 'text-slate-900'
                        : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>

                {/* Connecting Line */}
                {index < visualSteps.length - 1 && (
                  <div
                    className={`h-px w-full mx-4 sm:mx-2 hidden sm:block ${
                      isCompleted ? 'bg-emerald-200' : 'bg-slate-200'
                    }`}
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
