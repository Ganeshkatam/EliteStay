'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { NotificationType, type NotificationRow } from '../types';

/**
 * Creates a notification for a specific user.
 * This is the single entry point for all feature modules to generate notifications.
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
    const supabase = await createClient();
    
    // We do NOT use getUser() here because this might be triggered by another user
    // e.g., guest books host's place -> notification for host.
    // The server client with service_role is NOT used according to rules, 
    // but standard insert with authenticated user context is allowed if RLS permits.
    // Wait, the RLS policy says:
    // CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
    // This allows any authenticated user to insert notifications for ANY user (like sending a message).
    
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    });

    if (error) {
      console.error('Failed to create notification:', error);
  }
}

export async function notifyNewMessage(recipientId: string, senderName: string, conversationId: string) {
  return createNotification({
      userId: recipientId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New Message',
      message: `You received a new message from ${senderName}.`,
      link: `/users/inbox/${conversationId}`,
  });
}

export async function notifyBookingRequest(hostId: string, listingTitle: string) {
  return createNotification({
      userId: hostId,
      type: NotificationType.BOOKING_REQUEST,
      title: 'New Booking Request',
      message: `You have a new request for ${listingTitle}.`,
      link: '/host/stays',
  });
}

export async function notifyBookingApproved(guestId: string, listingTitle: string) {
  return createNotification({
      userId: guestId,
      type: NotificationType.BOOKING_APPROVED,
      title: 'Booking Approved!',
      message: `Your booking request for ${listingTitle} was approved.`,
      link: '/users',
  });
}

export async function notifyBookingRejected(guestId: string, listingTitle: string) {
  return createNotification({
      userId: guestId,
      type: NotificationType.BOOKING_REJECTED,
      title: 'Booking Declined',
      message: `Your booking request for ${listingTitle} was declined.`,
      link: '/users',
  });
}

export async function notifyBookingCancelled(hostId: string, listingTitle: string) {
  return createNotification({
      userId: hostId,
      type: NotificationType.BOOKING_CANCELLED,
      title: 'Booking Cancelled',
      message: `A booking request for ${listingTitle} was cancelled by the guest.`,
      link: '/host/bookings',
  });
}

export async function notifyWelcome(userId: string) {
  return createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Welcome to EliteStay!',
      message: 'We are thrilled to have you here. Complete your profile to get started.',
      link: '/users/profile',
  });
}

export async function notifyPasswordChanged(userId: string) {
  return createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Password Changed',
      message: 'Your account password has been successfully updated.',
      link: '/users/settings',
  });
}

export async function notifyProfileUpdated(userId: string) {
  return createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      link: '/users/profile',
  });
}

export async function getMyNotifications(): Promise<NotificationRow[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

  return (data as NotificationRow[]) || [];
}

export async function markRead(notificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Unauthorized' };

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id);
}

export async function markAllRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Unauthorized' };

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

  revalidatePath('/users/notifications');
}
