import React from 'react';
import { launchFirstListingAction } from '@/features/hosting/actions/hosting.actions';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { OnboardingSubmitButton } from '@/features/hosting/components/OnboardingSubmitButton';

export default function ReadyStepPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-8 space-y-6 mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Host Workspace is Ready
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You now have access to the EliteStay Host Workspace. You can create
            draft listings, configure property details, and complete your payout
            and tax compliance setup.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 text-left space-y-4 text-xs shadow-sm">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Host Setup
            Complete
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Host Profile Created</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Specialization Selected</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Mandatory Policies Accepted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Workspace Access Granted</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-slate-500 leading-relaxed">
              <strong className="text-slate-700">
                Listing Publication Requirements:
              </strong>{' '}
              Before publishing your listing to live residents, you will verify
              your identity, configure your payout bank account, and complete
              tax registration directly inside the host workspace.
            </p>
          </div>
        </div>

        <form action={launchFirstListingAction} className="pt-4">
          <OnboardingSubmitButton
            label="Enter Host Workspace & Create Listing"
            loadingLabel="Launching Workspace..."
            fullWidth
            className="py-4 text-base"
          />
        </form>
      </div>
    </div>
  );
}
