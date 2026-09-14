import { ReactNode } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { MainPanel } from '@/features/dashboard/components/MainPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - EliteStay',
  description: 'Manage your EliteStay account',
};

import { requireUser } from '@/features/auth/server/auth-helpers';

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  return (
    <DashboardShell>
      <MainPanel />
      {children}
    </DashboardShell>
  );
}
