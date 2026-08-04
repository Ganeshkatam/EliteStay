import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { SecuritySettings } from '@/features/profile/components/SettingsForms';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Settings - EliteStay',
  description: 'Manage your account security and authentication.',
};

export default async function SecurityPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/security');
  }

  return (
    <>
      <DashboardHeader
        title="Security"
        description="Manage your account security and authentication."
      />
      <div className="mt-10">
        <SecuritySettings data={preferences.security} />
      </div>
    </>
  );
}
