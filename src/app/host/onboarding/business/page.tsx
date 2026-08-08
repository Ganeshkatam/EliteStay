import React from 'react';
import Link from 'next/link';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';
import { submitBusinessStepAction } from '@/features/hosting/actions/hosting.actions';
import { Briefcase, ArrowRight } from 'lucide-react';

export default async function BusinessStepPage() {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Business & Operations
        </h2>
        <p className="text-slate-500 text-sm">
          Declare your legal operational structure and core accommodation
          specialization.
        </p>
      </div>

      <form action={submitBusinessStepAction} className="space-y-6">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold">Entity Type</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                viewModel.formData.businessType === 'individual' ||
                !viewModel.formData.businessType
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="businessType"
                value="individual"
                defaultChecked={
                  viewModel.formData.businessType === 'individual' ||
                  !viewModel.formData.businessType
                }
                className="hidden"
              />
              <div className="font-bold text-sm text-slate-900 mb-1">
                Individual / Sole Owner
              </div>
              <div className="text-xs text-slate-500">
                Operating under your own legal name
              </div>
            </label>
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                viewModel.formData.businessType === 'company'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="businessType"
                value="company"
                defaultChecked={viewModel.formData.businessType === 'company'}
                className="hidden"
              />
              <div className="font-bold text-sm text-slate-900 mb-1">
                Registered Company
              </div>
              <div className="text-xs text-slate-500">
                LLP, Pvt Ltd, or Corporate Entity
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Business / Legal Name
              </label>
              <input
                type="text"
                name="businessName"
                required
                defaultValue={viewModel.formData.businessName}
                placeholder="e.g., Sharma Properties"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Primary Accommodation Specialization
              </label>
              <select
                name="primaryAccommodationSlug"
                required
                defaultValue={
                  viewModel.formData.primaryAccommodationSlug || 'apartment'
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all appearance-none"
              >
                <option value="apartment">Apartments & Flats</option>
                <option value="villa">Villas & Independent Houses</option>
                <option value="co-living">Co-Living Spaces</option>
                <option value="pg">Paying Guest (PG)</option>
                <option value="serviced-apartment">Serviced Apartments</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                This configures your default workflow rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tax ID Type
              </label>
              <select
                name="taxIdType"
                defaultValue={viewModel.formData.taxIdType}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all appearance-none"
              >
                <option value="PAN">PAN</option>
                <option value="GSTIN">GSTIN</option>
                <option value="SSN">SSN</option>
                <option value="EIN">EIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tax ID Number
              </label>
              <input
                type="text"
                name="taxIdNumber"
                required
                defaultValue={viewModel.formData.taxIdLast4}
                placeholder="e.g., ABCDE1234F"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Resident Support Phone (Optional)
              </label>
              <input
                type="tel"
                name="supportPhone"
                defaultValue={viewModel.formData.supportPhone}
                placeholder="e.g., +91 80 2233 4455"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Resident Support Email (Optional)
              </label>
              <input
                type="email"
                name="supportEmail"
                defaultValue={viewModel.formData.supportEmail}
                placeholder="e.g., stay@sharmaresidences.in"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-4">
          <Link
            href="/host/onboarding/bank"
            className="text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Back to Bank Setup
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20"
          >
            Save Business Profile & Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
