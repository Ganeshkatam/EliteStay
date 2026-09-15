'use client';

import React, { useState, useTransition } from 'react';
import {
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HostComplianceSummary } from '../services/host-compliance.service';
import {
  submitIdentityKycAction,
  savePayoutAccountAction,
  saveTaxRegistrationAction,
} from '../actions/hosting.actions';
import { cn } from '@/lib/utils';

interface ComplianceCenterViewProps {
  summary: HostComplianceSummary;
}

export function ComplianceCenterView({ summary }: ComplianceCenterViewProps) {
  const [identityPending, startIdentityTransition] = useTransition();
  const [payoutPending, startPayoutTransition] = useTransition();
  const [taxPending, startTaxTransition] = useTransition();

  const [identityMessage, setIdentityMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [payoutMessage, setPayoutMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [taxMessage, setTaxMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleIdentitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIdentityMessage(null);
    const formData = new FormData(e.currentTarget);

    startIdentityTransition(async () => {
      try {
        await submitIdentityKycAction(formData);
        setIdentityMessage({
          type: 'success',
          text: 'Identity verification documents submitted for verification.',
        });
      } catch (err: unknown) {
        setIdentityMessage({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : 'Failed to submit identity KYC',
        });
      }
    });
  };

  const handlePayoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPayoutMessage(null);
    const formData = new FormData(e.currentTarget);

    startPayoutTransition(async () => {
      try {
        await savePayoutAccountAction(formData);
        setPayoutMessage({
          type: 'success',
          text: 'Payout bank account saved and submitted for verification.',
        });
      } catch (err: unknown) {
        setPayoutMessage({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : 'Failed to save payout details',
        });
      }
    });
  };

  const handleTaxSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTaxMessage(null);
    const formData = new FormData(e.currentTarget);

    startTaxTransition(async () => {
      try {
        await saveTaxRegistrationAction(formData);
        setTaxMessage({
          type: 'success',
          text: 'Tax registration recorded and submitted for validation.',
        });
      } catch (err: unknown) {
        setTaxMessage({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : 'Failed to save tax registration',
        });
      }
    });
  };

  const allVerified =
    summary.identity.isVerified &&
    summary.payout.isVerified &&
    summary.tax.isVerified;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Host Compliance & Verification
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify your legal identity, direct deposit bank account, and tax
              details to enable live listing publication.
            </p>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border shrink-0',
              allVerified
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}
          >
            {allVerified ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fully
                Compliant
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-600" /> Publication Locked
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3 Main Compliance Cards */}
      <div className="grid grid-cols-1 gap-8">
        {/* Card 1: Identity Verification (KYC) */}
        <section
          id="identity"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all scroll-mt-20"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1. Government Identity Verification (KYC)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official government ID verification required for host legal
                  compliance.
                </p>
              </div>
            </div>

            <StatusBadge
              isVerified={summary.identity.isVerified}
              isPending={
                summary.identity.isSubmitted && !summary.identity.isVerified
              }
            />
          </div>

          <div className="mt-6">
            {summary.identity.isVerified ? (
              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Government Identity Verified
                </div>
                <p className="text-emerald-700">
                  Your identity verification was successfully validated.
                  Reference:{' '}
                  <span className="font-mono">
                    {summary.identity.reference || 'VERIFIED'}
                  </span>
                </p>
              </div>
            ) : summary.identity.isSubmitted ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Identity Under Review
                  </div>
                  <p className="text-amber-700">
                    Your identification submission is currently being validated.
                    Verification status will update upon completion.
                  </p>
                </div>

                <form
                  onSubmit={handleIdentitySubmit}
                  className="space-y-4 pt-2"
                >
                  <p className="text-xs text-slate-500 font-medium">
                    Need to update your submission? Submit corrected
                    identification details below:
                  </p>
                  <IdentityFormFields />
                  {identityMessage && (
                    <ActionFeedback message={identityMessage} />
                  )}
                  <Button
                    type="submit"
                    disabled={identityPending}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    {identityPending
                      ? 'Submitting...'
                      : 'Update KYC Submission'}
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleIdentitySubmit} className="space-y-5">
                <IdentityFormFields />
                {identityMessage && (
                  <ActionFeedback message={identityMessage} />
                )}
                <Button
                  type="submit"
                  disabled={identityPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  {identityPending
                    ? 'Submitting...'
                    : 'Submit Identity for Verification'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Card 2: Payout Bank Account */}
        <section
          id="payout"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all scroll-mt-20"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Payout & Bank Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designated bank account for automated rent disbursements and
                  security deposits.
                </p>
              </div>
            </div>

            <StatusBadge
              isVerified={summary.payout.isVerified}
              isPending={
                summary.payout.isConfigured && !summary.payout.isVerified
              }
            />
          </div>

          <div className="mt-6">
            {summary.payout.isVerified ? (
              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bank Account Verified
                </div>
                <p className="text-emerald-700">
                  Bank:{' '}
                  <span className="font-semibold">
                    {summary.payout.bankName}
                  </span>{' '}
                  | Account:{' '}
                  <span className="font-mono font-semibold">
                    •••• •••• {summary.payout.accountLast4}
                  </span>
                </p>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-5">
                {summary.payout.isConfigured && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700">
                    Currently Configured:{' '}
                    <strong>{summary.payout.bankName}</strong> (••••{' '}
                    {summary.payout.accountLast4})
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="bankName"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Bank Name
                    </Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="e.g. State Bank of India, HDFC"
                      defaultValue={summary.payout.bankName || ''}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="accountNumber"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Account Number
                    </Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      type="password"
                      placeholder="Full bank account number"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="ifscCode"
                      className="text-xs font-semibold text-slate-700"
                    >
                      IFSC / Branch Routing Code
                    </Label>
                    <Input
                      id="ifscCode"
                      name="ifscCode"
                      placeholder="e.g. SBIN0001234"
                      className="text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="accountHolderName"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Account Holder Name
                    </Label>
                    <Input
                      id="accountHolderName"
                      name="accountHolderName"
                      placeholder="Name as registered with bank"
                      className="text-xs"
                    />
                  </div>
                </div>

                {payoutMessage && <ActionFeedback message={payoutMessage} />}

                <Button
                  type="submit"
                  disabled={payoutPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  {payoutPending
                    ? 'Saving Payout Account...'
                    : 'Save & Verify Bank Account'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Card 3: Statutory Tax Registration */}
        <section
          id="tax"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all scroll-mt-20"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  3. Statutory Tax Registration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanent Account Number (PAN) or GSTIN for tax deduction and
                  regulatory compliance.
                </p>
              </div>
            </div>

            <StatusBadge
              isVerified={summary.tax.isVerified}
              isPending={summary.tax.isRegistered && !summary.tax.isVerified}
            />
          </div>

          <div className="mt-6">
            {summary.tax.isVerified ? (
              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tax Registration Verified
                </div>
                <p className="text-emerald-700">
                  Tax Identifier:{' '}
                  <span className="font-mono font-semibold">
                    •••• •••• {summary.tax.taxIdLast4}
                  </span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleTaxSubmit} className="space-y-5">
                {summary.tax.isRegistered && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700">
                    Recorded Tax ID:{' '}
                    <strong>•••• {summary.tax.taxIdLast4}</strong> (Pending
                    Verification)
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="taxIdType"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Tax Identifier Type
                    </Label>
                    <select
                      id="taxIdType"
                      name="taxIdType"
                      defaultValue="PAN"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="PAN">
                        PAN (Permanent Account Number)
                      </option>
                      <option value="GSTIN">
                        GSTIN (Goods & Services Tax Number)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="taxId"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Tax ID / Number
                    </Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      placeholder="e.g. ABCDE1234F"
                      required
                      className="text-xs uppercase"
                    />
                  </div>
                </div>

                {taxMessage && <ActionFeedback message={taxMessage} />}

                <Button
                  type="submit"
                  disabled={taxPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  {taxPending
                    ? 'Registering Tax ID...'
                    : 'Register & Verify Tax ID'}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Specialization & Policies Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-semibold text-slate-900">
                Accommodation Specialization
              </div>
              <div className="text-xs text-slate-500">
                {summary.specialization.name}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Locked
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-semibold text-slate-900">
                Mandatory Operational Policies
              </div>
              <div className="text-xs text-slate-500">
                Anti-Discrimination & Maintenance SLA (2026.1)
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Current
          </span>
        </div>
      </div>
    </div>
  );
}

function IdentityFormFields() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="documentType"
          className="text-xs font-semibold text-slate-700"
        >
          Identification Document Type
        </Label>
        <select
          id="documentType"
          name="documentType"
          defaultValue="AADHAAR"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="AADHAAR">Aadhaar Card</option>
          <option value="PASSPORT">Passport</option>
          <option value="VOTER_ID">Voter ID Card</option>
          <option value="DRIVING_LICENSE">Driving License</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="documentNumber"
          className="text-xs font-semibold text-slate-700"
        >
          Document Identification Number
        </Label>
        <Input
          id="documentNumber"
          name="documentNumber"
          placeholder="e.g. 1234 5678 9012"
          required
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="legalFullName"
          className="text-xs font-semibold text-slate-700"
        >
          Legal Full Name (on document)
        </Label>
        <Input
          id="legalFullName"
          name="legalFullName"
          placeholder="Official legal name"
          required
          className="text-xs"
        />
      </div>
    </div>
  );
}

function StatusBadge({
  isVerified,
  isPending,
}: {
  isVerified: boolean;
  isPending: boolean;
}) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Under Review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <AlertCircle className="w-3.5 h-3.5" /> Unverified
    </span>
  );
}

function ActionFeedback({
  message,
}: {
  message: { type: 'success' | 'error'; text: string };
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg text-xs flex items-center gap-2 border',
        message.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-red-50 text-red-800 border-red-200'
      )}
    >
      {message.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}
