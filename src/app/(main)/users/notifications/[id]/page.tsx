import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';
import * as NotificationService from '@/features/notifications/actions/notification.actions';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarMinus,
  Reply,
  RefreshCcw,
  AlertCircle,
  Star,
  CheckCircle,
  LogOut,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Notification Details | EliteStay',
};

export default async function NotificationDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const notification = await NotificationService.getNotification(params.id);

  if (!notification) {
    return (
      <ContentPanel>
        <PageCanvas>
          <div className="max-w-3xl w-full mx-auto p-4 md:p-8 pt-8 md:pt-12 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Notification not found
            </h1>
            <p className="text-slate-500 mb-6">
              This notification may have been deleted or you don&apos;t have
              permission to view it.
            </p>
            <Button asChild variant="outline">
              <Link href="/users/notifications">Back to Notifications</Link>
            </Button>
          </div>
        </PageCanvas>
      </ContentPanel>
    );
  }

  // Automatically mark as read if it hasn't been read yet
  if (!notification.read_at) {
    await NotificationService.markRead(notification.id);
  }

  let Icon = Info;
  switch (notification.event_type) {
    case 'NEW_MESSAGE':
      Icon = MessageCircle;
      break;
    case 'BOOKING_REQUEST':
      Icon = CalendarClock;
      break;
    case 'BOOKING_APPROVED':
      Icon = CalendarCheck;
      break;
    case 'BOOKING_REJECTED':
      Icon = CalendarX;
      break;
    case 'BOOKING_CANCELLED':
      Icon = CalendarMinus;
      break;
    case 'HOST_RESPONSE':
      Icon = Reply;
      break;
    case 'CALENDAR_SYNC_SUCCESS':
      Icon = RefreshCcw;
      break;
    case 'CALENDAR_SYNC_FAILED':
      Icon = AlertCircle;
      break;
    case 'REVIEW_RECEIVED':
      Icon = Star;
      break;
    case 'REVIEW_REMINDER':
      Icon = Star;
      break;
    case 'STAY_CHECKED_IN':
      Icon = CheckCircle;
      break;
    case 'STAY_CHECKED_OUT':
      Icon = LogOut;
      break;
  }

  return (
    <ContentPanel>
      <PageCanvas>
        <div className="max-w-3xl w-full mx-auto p-4 md:p-8 pt-8 md:pt-12">
          <Link
            href="/users/notifications"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notifications
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                <Icon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {notification.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Received on{' '}
                  {format(
                    new Date(notification.created_at),
                    'MMMM d, yyyy h:mm a'
                  )}
                </p>
              </div>
            </div>

            <div className="prose prose-slate prose-p:leading-relaxed max-w-none mb-8">
              <p className="text-slate-700 text-base md:text-lg whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {notification.action_path && (
              <div className="pt-6 border-t border-slate-100">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={notification.action_path}>
                    Take Action
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
