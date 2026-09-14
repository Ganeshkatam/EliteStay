import React from 'react';
import { Metadata } from 'next';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';

import { OnboardingStepper } from '@/features/hosting/components/OnboardingStepper';

export const metadata: Metadata = {
  title: 'Host Capabilities Onboarding & Eligibility | EliteStay',
  description:
    'Verify operational runtime facts and unlock professional long-term accommodation hosting capabilities.',
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <OnboardingStepper steps={viewModel.steps} />
      <main className="w-full max-w-3xl mx-auto px-6 sm:px-12 pt-8">
        {children}
      </main>
    </div>
  );
}
