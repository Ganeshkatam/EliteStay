import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { CommunicationSettings } from '@/features/profile/components/SettingsForms';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Communication Settings - EliteStay',
  description: 'Manage how guests and hosts communicate with you.',
};

export default async function CommunicationPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/communication');
  }

  return (
    <>
      <DashboardHeader
        title="Communication"
        description="Manage how guests and hosts communicate with you."
      />
      <div className="mt-10">
        <CommunicationSettings data={preferences.communication} />
      </div>
    </>
  );
}
