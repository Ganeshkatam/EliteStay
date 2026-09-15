import { SupabaseClient } from '@supabase/supabase-js';
import {
  ConversationRepository,
  ConversationType,
  ConversationRow,
} from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { recordBusinessEvent } from '@/lib/observability/events/business-events';
import * as NotificationService from '@/features/notifications/actions/notification-actions';

export class MessagingService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.conversationRepo = new ConversationRepository(supabase);
    this.messageRepo = new MessageRepository(supabase);
  }

  async createConversation(params: {
    type: ConversationType;
    listingId?: string;
    bookingId?: string;
    stayId?: string;
    guestId: string;
    hostProfileId: string;
  }): Promise<ConversationRow> {
    // Validate based on type
    if (params.type === 'INQUIRY' && !params.listingId) {
      throw new Error('INQUIRY conversations require a listingId');
    }
    if (params.type === 'BOOKING' && !params.bookingId) {
      throw new Error('BOOKING conversations require a bookingId');
    }
    if (params.type === 'STAY' && !params.stayId) {
      throw new Error('STAY conversations require a stayId');
    }

    // Validate guest privacy preference for inquiries
    if (params.type === 'INQUIRY') {
      const { data: guestPrefs } = await this.supabase
        .from('user_preferences')
        .select('privacy')
        .eq('user_id', params.guestId)
        .maybeSingle();

      const privacy = guestPrefs?.privacy as {
        allow_host_messages?: boolean;
      } | null;
      if (privacy?.allow_host_messages === false) {
        throw new Error(
          'This resident has chosen not to receive direct host inquiries.'
        );
      }
    }

    const conversation = await this.conversationRepo.createConversation(params);

    if (params.type === 'INQUIRY') {
      recordBusinessEvent('INQUIRY_CREATED', {
        conversationId: conversation.id,
        listingId: params.listingId || 'unknown',
        guestId: params.guestId,
      });
    }

    return conversation;
  }

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    senderRole: 'guest' | 'host';
  }) {
    // Insert the message
    const message = await this.messageRepo.insertMessage({
      conversationId: params.conversationId,
      senderId: params.senderId,
      content: params.content,
    });

    // Fetch conversation to determine recipient
    const conversation = await this.conversationRepo.findById(
      params.conversationId
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Since we know the hostProfileId and guestId on the conversation,
    // we can easily determine the recipient.
    // If the sender is the guest, the recipient is the host profile.
    // If the sender is the host, the recipient is the guest.
    // NOTE: For notifications we need the actual user ID of the host.
    let recipientId = conversation.guest_id;
    if (params.senderRole === 'guest') {
      // Need to fetch host user id
      const { data: hostProfile } = await this.supabase
        .from('host_profiles')
        .select('user_id')
        .eq('id', conversation.host_profile_id)
        .single();
      if (hostProfile) {
        recipientId = hostProfile.user_id;
      }
    }

    // Trigger Notification
    await NotificationService.notifyNewMessage(
      recipientId,
      message.sender?.full_name || 'Someone',
      params.conversationId
    );

    recordBusinessEvent('MESSAGE_SENT', {
      conversationId: params.conversationId,
      senderId: params.senderId,
      role: params.senderRole,
    });

    if (params.senderRole === 'host') {
      recordBusinessEvent('HOST_REPLIED', {
        conversationId: params.conversationId,
      });
    } else {
      recordBusinessEvent('GUEST_REPLIED', {
        conversationId: params.conversationId,
      });
    }

    return message;
  }

  async markConversationRead(conversationId: string, recipientId: string) {
    await this.messageRepo.markAsRead(conversationId, recipientId);
    recordBusinessEvent('MESSAGE_READ', { conversationId, recipientId });
  }

  async archiveConversation(conversationId: string) {
    const updated = await this.conversationRepo.updateStatus(
      conversationId,
      'ARCHIVED'
    );
    recordBusinessEvent('CONVERSATION_ARCHIVED', { conversationId });
    return updated;
  }

  async closeConversation(conversationId: string) {
    const updated = await this.conversationRepo.updateStatus(
      conversationId,
      'CLOSED'
    );
    return updated;
  }

  async getGuestInbox(
    guestId: string
  ): Promise<import('../view-models/inbox.viewmodel').GuestInboxViewModel[]> {
    const raw = await this.conversationRepo.findByGuestId(guestId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.map((r: any) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      unreadCount: 0, // Implement message counting
      latestMessage: null,
      updatedAt: r.updated_at,
      listing: r.listing
        ? {
            id: r.listing.id,
            title: r.listing.title,
            imageUrl: r.listing.images?.[0]?.storage_path || null,
          }
        : null,
      host: {
        businessName: r.host?.business_name || null,
        fullName: r.host?.user?.full_name || 'Unknown',
        avatarUrl: r.host?.user?.avatar_storage_path || null,
      },
    }));
  }

  async getHostInbox(
    hostProfileId: string
  ): Promise<import('../view-models/inbox.viewmodel').HostInboxViewModel[]> {
    const raw = await this.conversationRepo.findByHostProfileId(hostProfileId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.map((r: any) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      unreadCount: 0,
      latestMessage: null,
      updatedAt: r.updated_at,
      listing: r.listing
        ? {
            id: r.listing.id,
            title: r.listing.title,
            imageUrl: r.listing.images?.[0]?.storage_path || null,
          }
        : null,
      guest: {
        id: r.guest?.id,
        fullName: r.guest?.full_name || 'Unknown',
        avatarUrl: r.guest?.avatar_storage_path || null,
      },
      context: {
        bookingId: r.booking_id,
        stayId: r.stay_id,
      },
    }));
  }

  async getMessages(conversationId: string) {
    return this.messageRepo.findByConversationId(conversationId);
  }
}
