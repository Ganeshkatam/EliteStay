import { getConversations, markConversationRead } from '@/features/messaging/actions/conversation-actions';
import { getMessages } from '@/features/messaging/actions/message-actions';
import { ConversationHeader } from '@/features/messaging/components/ConversationHeader';
import { MessageTimeline } from '@/features/messaging/components/MessageTimeline';
import { MessageComposer } from '@/features/messaging/components/MessageComposer';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { notFound } from 'next/navigation';

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Or redirect
  }

  // Parallel fetching of conversation list and messages
  const [conversations, messages] = await Promise.all([
    getConversations(),
    getMessages(conversationId)
  ]);

  // Find the active conversation data to populate the header
  const conversation = conversations.find(c => c.id === conversationId);

  if (!conversation) {
    return notFound();
  }

  // Mark as read in the background
  if (conversation.unreadCount > 0) {
    markConversationRead(conversationId).catch(console.error);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <ConversationHeader 
        participant={conversation.otherParticipant} 
        listing={conversation.listing} 
        context={conversation.context}
      />
      
      <MessageTimeline 
        messages={messages} 
        currentUserId={user.id} 
      />
      
      <MessageComposer 
        conversationId={conversationId} 
      />
    </div>
  );
}
