import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DataSettings } from '@/features/profile/components/SettingsForms';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data & Privacy - EliteStay',
  description: 'Manage your personal data and privacy settings.',
};

export default async function DataPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/data');
  }

  return (
    <>
      <DashboardHeader
        title="Data & Privacy"
        description="Manage your personal data and privacy settings."
      />
      <div className="mt-10">
        <DataSettings data={preferences.data} />
      </div>
    </>
  );
}
