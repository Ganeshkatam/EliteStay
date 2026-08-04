import { getHostConversations } from '@/features/messaging/actions/conversation-actions';
import {
  getMessages,
  markMessagesAsRead,
} from '@/features/messaging/actions/message-actions';
import { HostConversationHeader } from '@/features/messaging/components/HostConversationHeader';
import { MessageTimeline } from '@/features/messaging/components/MessageTimeline';
import { MessageComposer } from '@/features/messaging/components/MessageComposer';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HostConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/login');
  }

  const supabase = await createClient();
  const { data: hostProfile } = await supabase
    .from('host_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!hostProfile) {
    return redirect('/host/onboarding');
  }

  // Parallel fetching of conversation list and messages
  const [conversations, messages] = await Promise.all([
    getHostConversations(hostProfile.id),
    getMessages(conversationId),
  ]);

  // Find the active conversation data to populate the header
  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation) {
    return notFound();
  }

  // Mark as read in the background
  if (conversation.unreadCount > 0) {
    markMessagesAsRead(conversationId).catch(console.error);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <HostConversationHeader conversation={conversation} />

      <MessageTimeline messages={messages} />

      <MessageComposer conversationId={conversationId} senderRole="host" />
    </div>
  );
}
