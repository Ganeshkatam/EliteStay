import { getConversations } from '../actions/conversation-actions';
import { ConversationList } from './ConversationList';

export async function ConversationListServer() {
  const conversations = await getConversations();
  return <ConversationList initialConversations={conversations} />;
}
