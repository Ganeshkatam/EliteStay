import { ReactNode } from 'react';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';
import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { Suspense } from 'react';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { RealtimeSubscriber } from '@/features/messaging/components/RealtimeSubscriber';
import { ConversationListServer } from '@/features/messaging/components/ConversationListServer';
import { ConversationListSkeleton } from '@/features/messaging/components/skeletons';

export default async function InboxLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <ContentPanel className="h-[calc(100vh-80px)] overflow-hidden items-stretch pt-6 md:pt-8 pb-0 md:pb-0">
      <PageCanvas className="p-0 md:p-0 flex overflow-hidden h-full">
        <RealtimeSubscriber currentUserId={user.id} />

        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
          <Suspense fallback={<ConversationListSkeleton />}>
            <ConversationListServer />
          </Suspense>
        </div>

        {/* Right Pane: Chat Window / Empty State */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden relative">
          {children}
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
