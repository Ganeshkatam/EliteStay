import { ReactNode } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { MainPanel } from '@/features/dashboard/components/MainPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - EliteStay',
  description: 'Manage your EliteStay account',
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <MainPanel />
      {children}
    </DashboardShell>
  );
}
