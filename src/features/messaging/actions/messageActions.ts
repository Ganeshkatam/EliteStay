import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions/createNotification';
import { safeAction } from '@/lib/safeAction';

export async function sendMessage(conversationId: string, content: string) {
  return safeAction(async (user, supabase) => {
    // Insert message
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

  if (error) {
    console.error('Failed to send message:', error);
    return { error: 'Failed to send message' };
  }

  // Find other participant to notify
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      booking_id,
      stay_id,
      bookings ( guest_id, listings ( host_id, title ) ),
      stays ( guest_id, listings ( host_id, title ) )
    `)
    .eq('id', conversationId)
    .single();

  if (conversation) {
    let guestId, hostId, listingTitle;
    const b = conversation.bookings as any;
    const s = conversation.stays as any;

    if (b) {
      guestId = b.guest_id;
      hostId = b.listings.host_id;
      listingTitle = b.listings.title;
    } else if (s) {
      guestId = s.guest_id;
      hostId = s.listings.host_id;
      listingTitle = s.listings.title;
    }

    const recipientId = user.id === guestId ? hostId : guestId;
    if (recipientId) {
      await createNotification({
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message regarding ${listingTitle}.`,
        link: `/messages/${conversationId}`
      });
    }
  }

    revalidatePath(`/messages/${conversationId}`);
    return { success: true };
  });
}

export async function getOrCreateConversation(params: { bookingId?: string; stayId?: string }) {
  return safeAction(async (user, supabase) => {
    const matchColumn = params.bookingId ? 'booking_id' : 'stay_id';
    const matchValue = params.bookingId || params.stayId;

    if (!matchValue) return { error: 'Must provide bookingId or stayId' };

    // Find existing
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq(matchColumn, matchValue)
      .single();

  if (existing) return { conversationId: existing.id };

  // Create new
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      [matchColumn]: matchValue
    } as any)
    .select('id')
    .single();

    if (error || !newConv) {
      return { error: 'Failed to create conversation' };
    }

    return { conversationId: newConv.id };
  });
}
