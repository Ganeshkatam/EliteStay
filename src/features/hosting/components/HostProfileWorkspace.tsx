'use client';

import React, { useState, useTransition } from 'react';
import { HostProfileWorkspaceViewModel } from '../types/hosting.types';
import {
  updateHostProfileSettingsAction,
  toggleHostOperationalStatusAction,
} from '../actions/hosting.actions';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Briefcase,
  CreditCard,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface HostProfileWorkspaceProps {
  viewModel: HostProfileWorkspaceViewModel;
}

/**
 * Permanent Host Profile Workspace (/host/profile) governing business entity settings and verified facts.
 * Decoupled from transient onboarding wizards and publishing builds.
 */
export const HostProfileWorkspace: React.FC<HostProfileWorkspaceProps> = ({
  viewModel,
}) => {
  const [selectedSlug, setSelectedSlug] = useState(
    viewModel.businessSummary.primaryAccommodationSlug || 'pg'
  );
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isFormPending, startFormTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleStatusToggle = () => {
    setFeedbackMessage(null);
    setFeedbackError(null);
    const nextStatus = viewModel.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    startStatusTransition(async () => {
      try {
        await toggleHostOperationalStatusAction(
          nextStatus as 'ACTIVE' | 'PAUSED'
        );
        setFeedbackMessage(
          nextStatus === 'ACTIVE'
            ? 'Operational capability resumed.'
            : 'Operations paused.'
        );
        setTimeout(() => setFeedbackMessage(null), 4000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Status update failed';
        setFeedbackError(msg);
      }
    });
  };

  const handleFormSubmit = (formData: FormData) => {
    setFeedbackMessage(null);
    setFeedbackError(null);

    startFormTransition(async () => {
      try {
        await updateHostProfileSettingsAction(formData);
        setFeedbackMessage('Entity settings saved successfully.');
        setTimeout(() => setFeedbackMessage(null), 4000);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Failed to save settings';
        setFeedbackError(msg);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-10">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Permanent Entity Settings
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Host Profile & Business Governance
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span>Capability Status:</span>
              <span
                className={`font-bold uppercase px-2 py-0.5 rounded transition-colors ${
                  viewModel.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : viewModel.status === 'PAUSED'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {viewModel.status}
              </span>
            </div>

            {(viewModel.status === 'ACTIVE' ||
              viewModel.status === 'PAUSED' ||
              viewModel.status === 'READY') && (
              <button
                type="button"
                disabled={isStatusPending}
                onClick={handleStatusToggle}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  viewModel.status === 'ACTIVE'
                    ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {isStatusPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : viewModel.status === 'ACTIVE' ? (
                  <>
                    <PauseCircle className="w-4 h-4" /> Pause Operations
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" /> Resume Active Operations
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {feedbackMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in-0 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {feedbackError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in-0 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{feedbackError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Verified Facts & Identity Summary Column */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Verified Identity Facts
                  </h2>
                  <span className="text-xs text-slate-500">
                    Linked User Profile Credentials
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">
                    Primary Host Legal Name
                  </span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {viewModel.identitySummary.fullName || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">
                    Registered Account Email
                  </span>
                  <span className="text-slate-800 font-medium">
                    {viewModel.identitySummary.email || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">
                    Verified Mobile Contact
                  </span>
                  <span className="text-slate-800 font-mono">
                    {viewModel.identitySummary.phone || 'None'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Host Registration ID</span>
                    <span className="text-slate-800 font-mono text-[10px]">
                      {viewModel.id || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Fact Verification Status
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 text-xs text-slate-500 shadow-sm">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                Multi-Capability Governance
              </div>
              <p className="leading-relaxed">
                Modifying your business operating entity or payout references
                here updates your Host Operational Platform records without
                impacting your guest reservations or profile capabilities.
              </p>
            </div>
          </aside>

          {/* Business Settings & Payout Configuration Form */}
          <main className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10">
            <form action={handleFormSubmit} className="space-y-10">
              {/* Section 1: Business Operating Entity */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Host Operating Profile & Specialization
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Primary Accommodation Specialization
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Governing classification for all published listings
                          and dashboards
                        </span>
                      </div>
                      {viewModel.businessSummary.isSpecializationLocked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs w-fit">
                          {viewModel.businessSummary.primaryAccommodationName ||
                            'PG / Paying Guest'}{' '}
                          (Locked)
                        </span>
                      ) : null}
                    </div>

                    {viewModel.businessSummary.isSpecializationLocked ? (
                      <p className="text-xs text-slate-500 font-medium">
                        This specialization cannot be changed after your first
                        listing is published.
                      </p>
                    ) : (
                      <div>
                        <input
                          type="hidden"
                          name="primaryAccommodationSlug"
                          value={selectedSlug}
                        />
                        <Select
                          value={selectedSlug}
                          onValueChange={setSelectedSlug}
                        >
                          <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:ring-slate-400">
                            <SelectValue placeholder="Select Specialization" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-lg bg-white">
                            <SelectItem
                              value="pg"
                              className="py-3 px-3 rounded-lg cursor-pointer hover:bg-slate-50"
                            >
                              PG (Paying Guest) - Managed stays with meal plans
                              & cleaning
                            </SelectItem>
                            <SelectItem
                              value="hostel"
                              className="py-3 px-3 rounded-lg cursor-pointer hover:bg-slate-50"
                            >
                              Student Hostel - Vibrant student dorms & communal
                              living
                            </SelectItem>
                            <SelectItem
                              value="apartment"
                              className="py-3 px-3 rounded-lg cursor-pointer hover:bg-slate-50"
                            >
                              Independent Apartment - Fully furnished
                              residential units
                            </SelectItem>
                            <SelectItem
                              value="house"
                              className="py-3 px-3 rounded-lg cursor-pointer hover:bg-slate-50"
                            >
                              Independent House / Villa - Private standalone
                              homes
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Operational Support Phone
                    </label>
                    <input
                      type="tel"
                      name="supportPhone"
                      defaultValue={
                        viewModel.businessSummary.supportPhone || ''
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Operational Support Email
                    </label>
                    <input
                      type="email"
                      name="supportEmail"
                      defaultValue={
                        viewModel.businessSummary.supportEmail || ''
                      }
                      placeholder="support@primeliving.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Governance & Payouts */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Payout Settlements & Banking
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Settlement Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      defaultValue={viewModel.payoutSummary.bankName || ''}
                      placeholder="e.g., HDFC Bank"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Disbursement Account Number Suffix
                    </label>
                    <input
                      type="text"
                      name="accountLast4"
                      defaultValue={
                        viewModel.payoutSummary.bankAccountLast4
                          ? `XXXX-XXXX-XXXX-${viewModel.payoutSummary.bankAccountLast4.replace(/[^0-9]/g, '')}`
                          : ''
                      }
                      placeholder="Enter account string to update"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      Tax Registration Reference:{' '}
                      {viewModel.payoutSummary.taxIdType || 'PAN'}
                    </span>
                    <span>
                      Registered Account Suffix:{' '}
                      {viewModel.payoutSummary.taxIdLast4
                        ? `******${viewModel.payoutSummary.taxIdLast4.replace(/[^0-9A-Z]/gi, '')}`
                        : 'Pending registration'}
                    </span>
                  </div>
                  {viewModel.payoutSummary.policiesAgreedAt && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> SLAs Active
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isFormPending}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-xl shadow-rose-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFormPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving
                      Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Permanent Entity
                      Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};
