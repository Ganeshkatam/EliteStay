import { getUserPreferences } from '@/features/profile/api/preferences';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { NotificationSettings } from '@/features/profile/components/SettingsForms';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notification Settings - EliteStay',
  description: 'Manage how you receive communications from us.',
};

export default async function NotificationsPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    redirect('/login?returnTo=/users/settings/notifications');
  }

  return (
    <>
      <DashboardHeader
        title="Notifications"
        description="Manage how you receive communications from us."
      />
      <div className="mt-10">
        <NotificationSettings data={preferences.notifications} />
      </div>
    </>
  );
}
