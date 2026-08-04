'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { MessagingService } from '../services/messaging.service';

export async function getMessages(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();
  const service = new MessagingService(supabase);

  const messages = await service.getMessages(conversationId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return messages.map((m: any) => ({
    id: m.id,
    content: m.content,
    createdAt: m.created_at,
    isMine: m.sender_id === user.id,
    isRead: !!m.read_at,
    senderName: m.sender?.full_name || 'Unknown',
    senderAvatarUrl: m.sender?.avatar_storage_path || null,
  }));
}

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  senderRole: 'guest' | 'host';
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();
  const service = new MessagingService(supabase);

  const m = await service.sendMessage({
    conversationId: params.conversationId,
    content: params.content,
    senderId: user.id,
    senderRole: params.senderRole,
  });

  return {
    id: m.id,
    content: m.content,
    createdAt: m.created_at,
    isMine: true,
    isRead: false,
    senderName: m.sender?.full_name || 'Unknown',
    senderAvatarUrl: m.sender?.avatar_storage_path || null,
  };
}

export async function markMessagesAsRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();
  const service = new MessagingService(supabase);
  await service.markConversationRead(conversationId, user.id);
}
