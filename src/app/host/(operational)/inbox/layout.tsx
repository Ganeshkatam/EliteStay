import { ReactNode } from 'react';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';
import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { RealtimeSubscriber } from '@/features/messaging/components/RealtimeSubscriber';
import { getHostConversations } from '@/features/messaging/actions/conversation-actions';
import { HostConversationList } from '@/features/messaging/components/HostConversationList';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HostInboxLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: hostProfile } = await supabase
    .from('host_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!hostProfile) {
    redirect('/host/onboarding');
  }

  const conversations = await getHostConversations(hostProfile.id);

  return (
    <ContentPanel className="h-[calc(100vh-80px)] overflow-hidden items-stretch pt-6 md:pt-8 pb-0 md:pb-0">
      <PageCanvas className="p-0 md:p-0 flex overflow-hidden h-full">
        <RealtimeSubscriber currentUserId={user.id} />

        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
          <HostConversationList initialConversations={conversations} />
        </div>

        {/* Right Pane: Chat Window / Empty State */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden relative">
          {children}
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
