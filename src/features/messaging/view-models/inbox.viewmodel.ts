import {
  ConversationType,
  ConversationStatus,
} from '../repositories/conversation.repository';

export interface MessageViewModel {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  isRead: boolean;
  senderName: string;
  senderAvatarUrl: string | null;
}

export interface BaseConversationViewModel {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  unreadCount: number;
  latestMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    imageUrl: string | null;
  } | null;
}

export interface GuestInboxViewModel extends BaseConversationViewModel {
  host: {
    businessName: string | null;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface HostInboxViewModel extends BaseConversationViewModel {
  guest: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  context: {
    bookingId?: string | null;
    stayId?: string | null;
    reservationStatus?: string; // Derived from booking or stay
  };
}
