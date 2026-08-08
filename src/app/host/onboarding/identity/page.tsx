import React from 'react';
import Link from 'next/link';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';
import { submitIdentityStepAction } from '@/features/hosting/actions/hosting.actions';
import { UserCheck, ArrowRight } from 'lucide-react';

export default async function IdentityStepPage() {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Identity Verification
        </h2>
        <p className="text-slate-500 text-sm">
          EliteStay requires all hosts to operate under verified identities to
          maintain trust and safety within the resident ecosystem.
        </p>
      </div>

      <form action={submitIdentityStepAction} className="space-y-6">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3 text-slate-700">
              <UserCheck className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold">
                Primary Account Holder
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Legal Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                defaultValue={viewModel.formData.fullName}
                placeholder="e.g., Arjun Sharma"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Verified Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                defaultValue={viewModel.formData.phone}
                placeholder="e.g., +91 98765 43210"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20"
          >
            Save & Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
