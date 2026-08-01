import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { HostingSettings } from '@/features/profile/components/SettingsForms';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hosting Settings - EliteStay',
  description: 'Manage your hosting preferences and tools.',
};

export default async function HostingPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/hosting');
  }

  return (
    <>
      <DashboardHeader
        title="Hosting"
        description="Manage your hosting preferences and tools."
      />
      <div className="mt-10">
        <HostingSettings data={preferences.hosting} />
      </div>
    </>
  );
}
