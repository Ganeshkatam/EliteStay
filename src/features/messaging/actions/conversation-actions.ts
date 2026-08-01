'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';

export type ConversationParticipant = {
  id: string;
  name: string;
  avatar_url: string | null;
  role: 'host' | 'guest';
};

export type ConversationListRow = {
  id: string;
  listing: {
    id: string;
    title: string;
  };
  context: {
    type: 'booking' | 'stay' | 'inquiry';
    status?: string;
    startDate?: string;
    endDate?: string;
  };
  otherParticipant: ConversationParticipant;
  latestMessage: {
    content: string;
    created_at: string;
    sender_id: string | null;
  } | null;
  unreadCount: number;
  updated_at: string; // Used for sorting
};

export async function getConversations(): Promise<ConversationListRow[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Query all conversations we have access to
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      guest_last_read_at,
      host_last_read_at,
      booking:bookings (
        id,
        guest_id,
        status,
        requested_move_in,
        guest:profiles!bookings_guest_id_fkey(id, full_name, avatar_storage_path),
        listing:listings (
          id,
          title,
          host_id,
          host:profiles!listings_host_id_fkey(id, full_name, avatar_storage_path)
        )
      ),
      stay:stays (
        id,
        guest_id,
        start_date,
        end_date,
        guest:profiles!stays_guest_id_fkey(id, full_name, avatar_storage_path),
        listing:listings (
          id,
          title,
          host_id,
          host:profiles!listings_host_id_fkey(id, full_name, avatar_storage_path)
        )
      ),
      messages (
        id,
        content,
        created_at,
        sender_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }

  // Format the data
  const formatted: ConversationListRow[] = (conversations || []).map((conv: any) => {
    // A conversation is tied to either a booking or a stay
    const reference = conv.booking || conv.stay;
    const isHost = reference.listing.host_id === user.id;
    
    const otherProfile = isHost ? reference.guest : reference.listing.host;
    const otherParticipant: ConversationParticipant = {
      id: otherProfile.id,
      name: otherProfile.full_name || 'Unknown User',
      avatar_url: otherProfile.avatar_storage_path,
      role: isHost ? 'guest' : 'host'
    };

    // Sort messages by created_at desc to find latest
    const sortedMessages = (conv.messages || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestMessage = sortedMessages[0] || null;

    // Calculate unread count
    const lastReadAt = isHost ? conv.host_last_read_at : conv.guest_last_read_at;
    const unreadCount = sortedMessages.filter((msg: any) => {
      // Don't count my own messages as unread
      if (msg.sender_id === user.id) return false;
      // If we never read anything, it's unread
      if (!lastReadAt) return true;
      // Otherwise, compare timestamps
      return new Date(msg.created_at).getTime() > new Date(lastReadAt).getTime();
    }).length;

    let contextType: 'booking' | 'stay' | 'inquiry' = 'inquiry';
    let status: string | undefined;
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (conv.stay) {
      contextType = 'stay';
      startDate = conv.stay.start_date;
      endDate = conv.stay.end_date;
    } else if (conv.booking) {
      contextType = 'booking';
      status = conv.booking.status;
      startDate = conv.booking.requested_move_in;
    }

    return {
      id: conv.id,
      listing: {
        id: reference.listing.id,
        title: reference.listing.title
      },
      context: {
        type: contextType,
        status,
        startDate,
        endDate
      },
      otherParticipant,
      latestMessage,
      unreadCount,
      updated_at: latestMessage ? latestMessage.created_at : conv.created_at
    };
  });

  // Sort by latest message first
  return formatted.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function markConversationRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();

  // First we need to determine if we are the host or guest to know which column to update.
  // We can just fetch the conversation and inspect the booking/stay.
  const { data: conv, error: fetchErr } = await supabase
    .from('conversations')
    .select(`
      booking:bookings(listing:listings(host_id)),
      stay:stays(listing:listings(host_id))
    `)
    .eq('id', conversationId)
    .single();

  if (fetchErr || !conv) {
    throw new Error('Conversation not found');
  }

  const reference = (conv as any).booking || (conv as any).stay;
  // If the user is the host of the listing, they are the host. Otherwise, guest.
  const isHost = reference.listing.host_id === user.id;

  const updatePayload = isHost
    ? { host_last_read_at: new Date().toISOString() }
    : { guest_last_read_at: new Date().toISOString() };

  const { error: updateErr } = await supabase
    .from('conversations')
    .update(updatePayload as any)
    .eq('id', conversationId);

  if (updateErr) {
    console.error('Error updating read status:', updateErr);
    throw new Error('Failed to update read status');
  }
}
