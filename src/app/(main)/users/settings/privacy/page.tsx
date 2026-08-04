import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { PrivacySettings } from '@/features/profile/components/SettingsForms';
import { DeleteAccountDialog } from '@/features/profile/components/DeleteAccountDialog';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Settings - EliteStay',
  description: 'Manage what information is visible to others.',
};

export default async function PrivacyPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/privacy');
  }

  return (
    <>
      <DashboardHeader
        title="Privacy"
        description="Manage what information is visible to others."
      />
      <div className="mt-10">
        <PrivacySettings data={preferences.privacy} />
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 max-w-xl">
          Permanently delete your EliteStay account and all of your content.
          This action is not reversible, so please continue with caution.
        </p>
        <DeleteAccountDialog />
      </div>
    </>
  );
}
