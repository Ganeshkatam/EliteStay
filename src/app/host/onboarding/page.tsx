import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
 * Strictly adheres to the Thin Route Rule: authenticates session, invokes service, prepares metadata, renders UI.
 */
export default async function HostOnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/host/onboarding');
  }

  const params = await searchParams;
  const activeStepParam = params?.step ?? null;

  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(
    user.id,
    activeStepParam
  );

  return <HostOnboardingWizard viewModel={viewModel} />;
}
