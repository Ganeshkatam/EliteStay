'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import * as NotificationService from '@/features/notifications/actions/notification-actions';

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

export async function getMessages(
  conversationId: string
): Promise<MessageRow[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_storage_path)
    `
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (messages || []).map((msg: any) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    created_at: msg.created_at,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          name: msg.sender.full_name || 'Unknown User',
          avatar_url: msg.sender.avatar_storage_path,
        }
      : null,
  }));
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<MessageRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (!content || !content.trim()) {
    throw new Error('Message cannot be empty');
  }

  const supabase = await createClient();

  // Insert the message
  const { data: newMsg, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_storage_path)
    `
    )
    .single();

  if (error || !newMsg) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  // Get recipient for notification
  const { data: conv } = await supabase
    .from('conversations')
    .select('host_id, guest_id')
    .eq('id', conversationId)
    .single();

  if (conv) {
    const recipientId = conv.host_id === user.id ? conv.guest_id : conv.host_id;
    await NotificationService.notifyNewMessage(
      recipientId,
      user.user_metadata?.full_name || 'someone',
      conversationId
    );
  }

  const msgData = newMsg as unknown as {
    id: string;
    conversation_id: string;
    sender_id: string | null;
    content: string;
    created_at: string;
    sender: {
      id: string;
      full_name?: string | null;
      avatar_storage_path?: string | null;
    } | null;
  };

  return {
    id: msgData.id,
    conversation_id: msgData.conversation_id,
    sender_id: msgData.sender_id,
    content: msgData.content,
    created_at: msgData.created_at,
    sender: msgData.sender
      ? {
          id: msgData.sender.id,
          name: msgData.sender.full_name || 'Unknown User',
          avatar_url: msgData.sender.avatar_storage_path || null,
        }
      : null,
  };
}

export async function getOrCreateConversation(params: {
  bookingId?: string;
  stayId?: string;
}) {
  const matchColumn = params.bookingId ? 'booking_id' : 'stay_id';
  const matchValue = params.bookingId || params.stayId;

  if (!matchValue) return { error: 'Must provide bookingId or stayId' };

  const supabase = await createClient();

  // Find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq(matchColumn, matchValue)
    .single();

  if (existing) return { conversationId: existing.id };

  // Create new
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { [matchColumn]: matchValue };
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert(payload)
    .select('id')
    .single();

  if (error || !newConv) {
    return { error: 'Failed to create conversation' };
  }

  return { conversationId: newConv.id };
}
