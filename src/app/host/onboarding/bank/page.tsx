import React from 'react';
import Link from 'next/link';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';
import { submitBankStepAction } from '@/features/hosting/actions/hosting.actions';
import { CreditCard, Shield, ArrowRight } from 'lucide-react';

export default async function BankStepPage() {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Payout Account
        </h2>
        <p className="text-slate-500 text-sm">
          Provide the bank account details where your rental income and deposit
          transfers should be securely routed.
        </p>
      </div>

      <form action={submitBankStepAction} className="space-y-6">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3 text-slate-700">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold">Bank Information</span>
            </div>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                required
                defaultValue={viewModel.formData.bankName}
                placeholder="e.g., HDFC Bank"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                required
                defaultValue={viewModel.formData.accountLast4}
                placeholder="e.g., *********1234"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-4">
          <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-start">
            <Link
              href="/host/onboarding/identity"
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Back to Identity
            </Link>
            <Link
              href="/host/onboarding/policies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors border border-slate-200 shadow-sm"
            >
              Skip for Now
            </Link>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20"
          >
            Save Payout Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
