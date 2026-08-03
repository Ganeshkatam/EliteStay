import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HostProfileService, HostProfileWorkspace } from '@/features/hosting';

export const metadata: Metadata = {
  title: 'Host Profile & Business Entity Settings | EliteStay',
  description:
    'Manage permanent business operating entities, tax profiles, and tokenized payout references.',
};

/**
 * Thin Route for permanent Host Entity Profile Settings (/host/profile).
 * Strictly adheres to the Thin Route Rule: authenticates user, invokes HostProfileService, prepares metadata, renders UI.
 */
export default async function HostProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/host/profile');
  }

  const profileService = new HostProfileService();
  const viewModel = await profileService.getHostProfileWorkspace(user.id);

  return <HostProfileWorkspace viewModel={viewModel} />;
}
