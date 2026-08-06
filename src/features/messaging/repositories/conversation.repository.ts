import { SupabaseClient } from '@supabase/supabase-js';

export type ConversationStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED' | 'BLOCKED';
export type ConversationType =
  'INQUIRY' | 'BOOKING' | 'STAY' | 'SUPPORT' | 'SYSTEM';

export interface ConversationRow {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  listing_id: string | null;
  booking_id: string | null;
  stay_id: string | null;
  guest_id: string;
  host_profile_id: string;
  created_at: string;
  updated_at: string;
}

export class ConversationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createConversation(params: {
    type: ConversationType;
    status?: ConversationStatus;
    listingId?: string;
    bookingId?: string;
    stayId?: string;
    guestId: string;
    hostProfileId: string;
  }): Promise<ConversationRow> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        type: params.type,
        status: params.status || 'OPEN',
        listing_id: params.listingId || null,
        booking_id: params.bookingId || null,
        stay_id: params.stayId || null,
        guest_id: params.guestId,
        host_profile_id: params.hostProfileId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
    return data as ConversationRow;
  }

  async findById(id: string): Promise<ConversationRow | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching conversation:', error);
      throw new Error('Failed to fetch conversation');
    }
    return data as ConversationRow;
  }

  async findByGuestId(guestId: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        `
        *,
        listing:listings (id, title, images:listing_images(storage_path)),
        host:host_profiles!conversations_host_profile_id_fkey (id, business_name, user_id)
      `
      )
      .eq('guest_id', guestId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(
        'Error fetching guest conversations:',
        error.message,
        error.details,
        error.hint
      );
      throw new Error('Failed to fetch guest conversations');
    }

    if (!data || data.length === 0) return data;

    const userIds = data
      .map((row) => (row.host as { user_id?: string })?.user_id)
      .filter((id) => !!id);

    if (userIds.length > 0) {
      const { data: profiles } = await this.supabase
        .from('profiles')
        .select('id, full_name, avatar_storage_path')
        .in('id', userIds);

      const profileMap = new Map();
      if (profiles) {
        for (const p of profiles) {
          profileMap.set(p.id, p);
        }
      }

      for (const row of data) {
        const host = row.host as { user_id?: string; user?: unknown };
        if (host && host.user_id) {
          host.user = profileMap.get(host.user_id) || null;
        }
      }
    }

    return data;
  }

  async findByHostProfileId(hostProfileId: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        `
        *,
        listing:listings (id, title, images:listing_images(storage_path)),
        guest:profiles!conversations_guest_id_fkey (id, full_name, avatar_storage_path)
      `
      )
      .eq('host_profile_id', hostProfileId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching host conversations:', error);
      throw new Error('Failed to fetch host conversations');
    }
    return data;
  }

  async updateStatus(
    id: string,
    status: ConversationStatus
  ): Promise<ConversationRow> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating conversation status:', error);
      throw new Error('Failed to update conversation status');
    }
    return data as ConversationRow;
  }

  async findExistingInquiry(
    listingId: string,
    guestId: string
  ): Promise<ConversationRow | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('type', 'INQUIRY')
      .eq('listing_id', listingId)
      .eq('guest_id', guestId)
      .maybeSingle();

    if (error) {
      console.error('Error finding existing inquiry:', error);
      throw new Error('Failed to check for existing inquiry');
    }
    return data as ConversationRow | null;
  }
}
