import { SupabaseClient } from '@supabase/supabase-js';

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export class MessageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByConversationId(conversationId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_storage_path)
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
    return data;
  }

  async insertMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: params.conversationId,
        sender_id: params.senderId,
        content: params.content,
      })
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_storage_path)
      `
      )
      .single();

    if (error) {
      console.error('Error inserting message:', error);
      throw new Error('Failed to insert message');
    }
    return data;
  }

  async markAsRead(conversationId: string, recipientId: string) {
    // Note: recipientId is the ID of the person READING the messages.
    // We want to mark messages sent by the OTHER person as read.
    const { error } = await this.supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', recipientId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }
}
