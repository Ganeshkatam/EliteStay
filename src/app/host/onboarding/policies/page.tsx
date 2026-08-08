import Link from 'next/link';
import { submitPoliciesStepAction } from '@/features/hosting/actions/hosting.actions';
import { ShieldCheck, Briefcase, ArrowRight } from 'lucide-react';

export default function PoliciesStepPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Policies & SLAs
        </h2>
        <p className="text-slate-500 text-sm">
          Accept EliteStay&apos;s core hosting policies to activate your
          capabilities.
        </p>
      </div>

      <form action={submitPoliciesStepAction} className="space-y-6">
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-rose-500" /> 1. Resident
              Anti-Discrimination & Fairness SLA
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              By operating on EliteStay, you commit to evaluating all long-term
              tenant applications without bias toward gender, caste, religion,
              or personal lifestyle preferences outside verified property rules.
            </p>
            <label className="flex items-center gap-3 pt-2 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                required
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>
                I formally accept and abide by the EliteStay Anti-Discrimination
                & Resident Trust policy.
              </span>
            </label>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
              <Briefcase className="w-5 h-5 text-amber-500" /> 2. Operational
              Response Time & Maintenance SLA
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hosts agree to maintain active communication during active
              tenancies, respond to critical maintenance requests within 24
              hours, and honor confirmed check-in dates without cancellation.
            </p>
            <label className="flex items-center gap-3 pt-2 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                required
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
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
            href="/host/onboarding/business"
            className="text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Back to Business Profile
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20"
          >
            Agree to SLAs & Unlock Capabilities{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
