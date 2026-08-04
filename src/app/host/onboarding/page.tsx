import React from 'react';
import { Metadata } from 'next';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService, HostOnboardingWizard } from '@/features/hosting';

export const metadata: Metadata = {
  title: 'Host Capabilities Onboarding & Eligibility | EliteStay',
  description:
    'Verify operational runtime facts and unlock professional long-term accommodation hosting capabilities.',
};

interface OnboardingPageProps {
  searchParams?: Promise<{ step?: string }> | { step?: string };
}

/**
 * Thin Route for Host Capabilities Onboarding (/host/onboarding).
 * Uses HostAccessService.getHostContext() for authentication without requiring operational status.
 */
export default async function HostOnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { user } = await HostAccessService.getHostContext();

  const params = await searchParams;
  const activeStepParam = params?.step ?? null;

  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(
    user.id,
    activeStepParam
  );

  return <HostOnboardingWizard viewModel={viewModel} />;
}
