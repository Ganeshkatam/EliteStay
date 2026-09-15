import React from 'react';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';
import { submitIdentityStepAction } from '@/features/hosting/actions/hosting.actions';
import { CheckCircle2 } from 'lucide-react';
import { OnboardingSubmitButton } from '@/features/hosting/components/OnboardingSubmitButton';

function formatPhone(phone: string) {
  if (phone && phone.startsWith('+91') && phone.length === 13) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

export default async function IdentityStepPage() {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  const formattedPhone = formatPhone(viewModel.formData.phone);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Verify your identity
        </h2>
        <p className="text-slate-500 text-sm">
          We verify every host so residents can know who they&apos;re renting
          from.
        </p>
      </div>

      <form action={submitIdentityStepAction} className="space-y-6">
        <input
          type="hidden"
          name="fullName"
          value={viewModel.formData.fullName}
        />
        <input type="hidden" name="phone" value={viewModel.formData.phone} />

        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Your identity</h3>
          </div>
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="block text-xs font-medium text-slate-500 mb-1">
                  Legal name
                </span>
                <span className="text-slate-900 font-medium">
                  {viewModel.formData.fullName || 'Not provided'}
                </span>
              </div>
              {viewModel.formData.fullName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </div>
              )}
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="block text-xs font-medium text-slate-500 mb-1">
                  Phone number
                </span>
                <span className="text-slate-900 font-medium">
                  {formattedPhone || 'Not provided'}
                </span>
              </div>
              {viewModel.formData.phone && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <OnboardingSubmitButton
            label="Confirm & Continue"
            loadingLabel="Verifying & Saving..."
          />
        </div>
      </form>
    </div>
  );
}
