'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import { MessagingService } from '../services/messaging.service';
import { ConversationType } from '../repositories/conversation.repository';
import {
  GuestInboxViewModel,
  HostInboxViewModel,
} from '../view-models/inbox.viewmodel';

export async function getGuestConversations(): Promise<GuestInboxViewModel[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const service = new MessagingService(supabase);
    return await service.getGuestInbox(user.id);
  } catch (err) {
    console.error('Failed to get guest conversations:', err);
    return [];
  }
}

export async function getHostConversations(
  hostProfileId: string
): Promise<HostInboxViewModel[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const service = new MessagingService(supabase);
    return await service.getHostInbox(hostProfileId);
  } catch (err) {
    console.error('Failed to get host conversations:', err);
    return [];
  }
}

export async function createConversation(params: {
  type: ConversationType;
  listingId?: string;
  bookingId?: string;
  stayId?: string;
  guestId: string;
  hostProfileId: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();
  const service = new MessagingService(supabase);
  return service.createConversation(params);
}

export async function archiveConversation(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createClient();
  const service = new MessagingService(supabase);
  return service.archiveConversation(conversationId);
}

export async function getOrCreateConversation(params: {
  stayId?: string;
  bookingId?: string;
  listingId?: string;
}): Promise<{ conversationId?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };
  const supabase = await createClient();

  // Very simplified version just for compatibility with existing UI components
  // Real version should use Repositories.
  let query = supabase.from('conversations').select('id').limit(1);
  if (params.stayId) query = query.eq('stay_id', params.stayId);
  else if (params.bookingId) query = query.eq('booking_id', params.bookingId);
  else if (params.listingId) query = query.eq('listing_id', params.listingId);
  else return { error: 'Must provide context' };

  const { data: existing } = await query.single();
  if (existing) {
    return { conversationId: existing.id };
  }

  // Create new (simplified for now to satisfy UI)
  return { error: 'Conversation creation not fully wired yet from this UI' };
}
