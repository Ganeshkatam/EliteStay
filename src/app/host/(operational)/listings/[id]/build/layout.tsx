import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';
import { PublishingWorkspaceShell } from '@/features/host/publishing/components/PublishingWorkspaceShell';

export const metadata = {
  title: 'Publishing Workspace - EliteStay',
};

export default async function BuildListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let viewModel;
  try {
    viewModel = await PublishingService.getWorkspace(supabase, id, user.id);
  } catch (error) {
    console.error('Failed to load publishing workspace:', error);
    redirect('/host/listings');
  }

  return (
    <PublishingWorkspaceShell viewModel={viewModel}>
      {children}
    </PublishingWorkspaceShell>
  );
}
