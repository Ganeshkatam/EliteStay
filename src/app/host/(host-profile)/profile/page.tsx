import React from 'react';
import { Metadata } from 'next';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
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
  const { user } = await HostAccessService.requireHostProfile();

  const profileService = new HostProfileService();
  const viewModel = await profileService.getHostProfileWorkspace(user.id);

  return <HostProfileWorkspace viewModel={viewModel} />;
}
