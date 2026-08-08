import React from 'react';
import { launchFirstListingAction } from '@/features/hosting/actions/hosting.actions';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReadyStepPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-8 space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            You&apos;re Ready to Host!
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Congratulations! Your hosting capabilities are fully verified and
            active. Your user account now possesses dual Guest and Host
            operational capabilities.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-2 text-xs shadow-sm">
          <div className="font-bold text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Capability Bridge Complete
          </div>
          <p className="text-slate-500">
            When you click below, you will enter our dedicated Publishing
            Workspace to assemble photos, pricing, and accommodation terms. Your
            host status will transition to{' '}
            <span className="text-slate-900 font-bold">ACTIVE</span> the instant
            your first listing goes live!
          </p>
        </div>

        <form action={launchFirstListingAction} className="pt-4">
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-lg shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <span>Create Your First Listing</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
