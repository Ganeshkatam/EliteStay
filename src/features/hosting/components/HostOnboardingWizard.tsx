'use client';

import React from 'react';
import Link from 'next/link';
import { OnboardingWorkspaceViewModel } from '../types/hosting.types';
import {
  submitIdentityStepAction,
  submitBankStepAction,
  submitBusinessStepAction,
  submitPoliciesStepAction,
  launchFirstListingAction,
} from '../actions/hosting.actions';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  CreditCard,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';

interface HostOnboardingWizardProps {
  viewModel: OnboardingWorkspaceViewModel;
}

/**
 * Host Onboarding & Eligibility Workspace (/host/onboarding).
 * Governed by the Operational Workspace Rule and configuration-driven step sequencing.
 */
export const HostOnboardingWizard: React.FC<HostOnboardingWizardProps> = ({
  viewModel,
}) => {
  const currentStep =
    viewModel.steps.find((s) => s.id === viewModel.currentStepId) ??
    viewModel.steps[0];

  const getStepIcon = (id: string) => {
    switch (id) {
      case 'eligibility':
        return <FileText className="w-4 h-4" />;
      case 'identity':
        return <UserCheck className="w-4 h-4" />;
      case 'bank':
        return <CreditCard className="w-4 h-4" />;
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      case 'policies':
        return <ShieldCheck className="w-4 h-4" />;
      case 'ready':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20 px-6 sm:px-12 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Hosting Capabilities Onboarding
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enable EliteStay Hosting
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
          <span>Current Capability Status:</span>
          <span
            className={`font-bold uppercase px-2 py-0.5 rounded ${
              viewModel.status === 'READY' || viewModel.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            {viewModel.status}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Configuration-Driven Step Navigation Sidebar */}
        <nav className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block">
            Transformation Pipeline
          </span>
          {viewModel.steps.map((step, index) => {
            const isSelected = step.id === viewModel.currentStepId;
            return (
              <Link
                key={step.id}
                href={`/host/onboarding?step=${step.id}`}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 text-left w-full block ${
                  isSelected
                    ? 'bg-slate-900 border-rose-500/50 text-white shadow-lg shadow-rose-950/20'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {getStepIcon(step.id)}
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      <span>
                        Step {index} — {step.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {step.description}
                    </div>
                  </div>
                </div>
                {step.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </Link>
            );
          })}

          <div className="mt-8 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-rose-400" /> Multi-Capability
              Identity
            </div>
            <p className="leading-relaxed">
              Enabling hosting capabilities never replaces or invalidates your
              guest status. You retain full dual-capability operation across
              EliteStay.
            </p>
          </div>
        </nav>

        {/* Workspace Step Content Area */}
        <main className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="border-b border-slate-800/80 pb-6 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {currentStep.description}
            </p>
          </div>

          {/* Step 0: Eligibility Fact Audit */}
          {currentStep.id === 'eligibility' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="text-sm font-bold text-slate-200 block">
                  Verified Runtime Facts Audit
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Identity & Contact Fact',
                      verified:
                        viewModel.eligibilityAudit.hasIdentityVerifiedFact,
                    },
                    {
                      label: 'Payout Bank Account Fact',
                      verified: viewModel.eligibilityAudit.hasBankLinkedFact,
                    },
                    {
                      label: 'Tax Profile & Business Fact',
                      verified:
                        viewModel.eligibilityAudit.hasTaxRegisteredFact &&
                        Boolean(viewModel.formData.businessName),
                    },
                    {
                      label: 'Trust SLA Agreements Fact',
                      verified:
                        viewModel.eligibilityAudit.hasPoliciesAgreedFact,
                    },
                  ].map((fact, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900 border border-slate-800/80"
                    >
                      <span className="text-xs font-semibold text-slate-300">
                        {fact.label}
                      </span>
                      {fact.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {viewModel.eligibilityAudit.isEligible ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">
                    All Operational Eligibility Criteria Met!
                  </h3>
                  <p className="text-xs text-slate-300">
                    You have verified all essential identity, banking, tax, and
                    trust SLA facts.
                  </p>
                  <Link
                    href="/host/onboarding?step=ready"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
                  >
                    Proceed to Onboarding Completion{' '}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Action Required: Fulfill Missing Facts
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Please advance through the wizard steps to verify
                      remaining criteria.
                    </p>
                  </div>
                  <Link
                    href="/host/onboarding?step=identity"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all whitespace-nowrap shadow-lg shadow-rose-950/50"
                  >
                    Begin Verification Wizard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Identity Verification */}
          {currentStep.id === 'identity' && (
            <form action={submitIdentityStepAction} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Legal Full Name (Matches Government Identity)
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={viewModel.formData.fullName}
                    required
                    placeholder="e.g., Rajesh Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Verified Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={viewModel.formData.phone}
                    required
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  Your identity verification fact will be permanently linked to
                  your host capability credentials while preserving guest
                  access.
                </span>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/50"
                >
                  Confirm Identity Facts & Continue{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Bank & Payouts */}
          {currentStep.id === 'bank' && (
            <form action={submitBankStepAction} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Commercial Bank Institution Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    defaultValue={viewModel.formData.bankName}
                    required
                    placeholder="e.g., HDFC Bank / ICICI Bank"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Account Number / IBAN (Secured Reference)
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    defaultValue={
                      viewModel.formData.accountLast4
                        ? `XXXX-XXXX-XXXX-${viewModel.formData.accountLast4.replace(/[^0-9]/g, '')}`
                        : ''
                    }
                    required
                    placeholder="Enter full payout account string"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Security Notice: For maximum host privacy and tokenized
                  safety, only verified reference IDs and account suffix digits
                  are stored in your permanent entity profile.
                </span>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Link
                  href="/host/onboarding?step=identity"
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back to Identity
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/50"
                >
                  Link Payout Account & Continue{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Business Entity & Tax */}
          {currentStep.id === 'business' && (
            <form action={submitBusinessStepAction} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Governed Business Operating Entity
                  </label>
                  <select
                    name="businessType"
                    defaultValue={viewModel.formData.businessType}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="individual">
                      Individual / Sole Proprietor
                    </option>
                    <option value="company">
                      Registered Company / Corporation
                    </option>
                    <option value="property_manager">
                      Professional Property Management Agency
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Business Operating Name (As appearing on lease agreements)
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    defaultValue={viewModel.formData.businessName}
                    required
                    placeholder="e.g., Sharma Urban Living Residences"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-500/20 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Primary Accommodation Specialization
                    </label>
                    <p className="text-xs text-rose-300/80 leading-relaxed">
                      Choose the accommodation model you operate. Your host
                      workspace, publishing tools, and operational workflows
                      will be tailored specifically for this accommodation type.{' '}
                      <strong className="text-rose-400 font-bold">
                        This specialization cannot be changed after your first
                        listing is published.
                      </strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      {
                        value: 'pg',
                        label: 'PG (Paying Guest)',
                        desc: 'Managed stays with meal plans & cleaning',
                      },
                      {
                        value: 'hostel',
                        label: 'Student Hostel',
                        desc: 'Vibrant student dorms & communal living',
                      },
                      {
                        value: 'apartment',
                        label: 'Home / Apartment',
                        desc: 'Fully independent private flats & houses',
                      },
                      {
                        value: 'other',
                        label: 'Other Residence',
                        desc: 'Specialized living facilities and unique stays',
                      },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className="relative flex flex-col p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">
                            {item.label}
                          </span>
                          <input
                            type="radio"
                            name="primaryAccommodationSlug"
                            value={item.value}
                            defaultChecked={
                              viewModel.formData.primaryAccommodationSlug ===
                                item.value ||
                              (!viewModel.formData.primaryAccommodationSlug &&
                                item.value === 'pg')
                            }
                            required
                            className="text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Tax Identification Classification
                    </label>
                    <select
                      name="taxIdType"
                      defaultValue={viewModel.formData.taxIdType}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="PAN">
                        PAN (Permanent Account Number - India)
                      </option>
                      <option value="GSTIN">
                        GSTIN (Goods & Services Tax - India)
                      </option>
                      <option value="SSN_EIN">
                        SSN / EIN (United States / International)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Tax ID Registration Number
                    </label>
                    <input
                      type="text"
                      name="taxIdNumber"
                      defaultValue={
                        viewModel.formData.taxIdLast4
                          ? `******${viewModel.formData.taxIdLast4.replace(/[^0-9A-Z]/gi, '')}`
                          : ''
                      }
                      required
                      placeholder="Enter official Tax ID string"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Resident Support Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="supportPhone"
                      defaultValue={viewModel.formData.supportPhone}
                      placeholder="e.g., +91 80 2233 4455"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Resident Support Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="supportEmail"
                      defaultValue={viewModel.formData.supportEmail}
                      placeholder="e.g., stay@sharmaresidences.in"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Link
                  href="/host/onboarding?step=bank"
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back to Bank Setup
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/50"
                >
                  Save Business Profile & Continue{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Policies & SLAs */}
          {currentStep.id === 'policies' && (
            <form action={submitPoliciesStepAction} className="space-y-6">
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3 font-bold text-white text-sm">
                    <ShieldCheck className="w-5 h-5 text-rose-400" /> 1.
                    Resident Anti-Discrimination & Fairness SLA
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By operating on EliteStay, you commit to evaluating all
                    long-term tenant applications without bias toward gender,
                    caste, religion, or personal lifestyle preferences outside
                    verified property rules.
                  </p>
                  <label className="flex items-center gap-3 pt-2 text-xs text-slate-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 w-4 h-4"
                    />
                    <span>
                      I formally accept and abide by the EliteStay
                      Anti-Discrimination & Resident Trust policy.
                    </span>
                  </label>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3 font-bold text-white text-sm">
                    <Briefcase className="w-5 h-5 text-amber-400" /> 2.
                    Operational Response Time & Maintenance SLA
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hosts agree to maintain active communication during active
                    tenancies, respond to critical maintenance requests within
                    24 hours, and honor confirmed check-in dates without
                    cancellation.
                  </p>
                  <label className="flex items-center gap-3 pt-2 text-xs text-slate-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 w-4 h-4"
                    />
                    <span>
                      I pledge to maintain operational readiness and comply with
                      response time SLA thresholds.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Link
                  href="/host/onboarding?step=business"
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back to Business Profile
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/50"
                >
                  Agree to SLAs & Unlock Hosting Capabilities{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Ready to Host & Transition CTA */}
          {currentStep.id === 'ready' && (
            <div className="text-center py-8 space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950/50">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  Youre Ready to Host!
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Congratulations! Your hosting capabilities are fully verified
                  and active. Your user account now possesses dual Guest and
                  Host operational capabilities.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Capability Bridge
                  Complete
                </div>
                <p className="text-slate-400">
                  When you click below, you will enter our dedicated Publishing
                  Workspace to assemble photos, pricing, and accommodation
                  terms. Your host status will transition to{' '}
                  <span className="text-white font-bold">ACTIVE</span> the
                  instant your first listing goes live!
                </p>
              </div>

              <form action={launchFirstListingAction} className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-lg shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all duration-200 flex items-center justify-center gap-3 group"
                >
                  <span>Create Your First Listing</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
