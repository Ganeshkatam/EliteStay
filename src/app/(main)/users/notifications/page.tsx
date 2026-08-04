import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';
import { NotificationWorkspace } from '@/features/notifications/components/NotificationWorkspace';
import * as NotificationService from '@/features/notifications/actions/notification-actions';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Notifications | EliteStay',
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const notifications = await NotificationService.getMyNotifications();

  return (
    <ContentPanel>
      <PageCanvas className="max-w-6xl w-full mx-auto p-4 md:p-8 pt-8 md:pt-12">
        <NotificationWorkspace initialNotifications={notifications} />
      </PageCanvas>
    </ContentPanel>
  );
}
