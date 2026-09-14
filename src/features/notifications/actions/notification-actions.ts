'use server';

import { NotificationType } from '../types';
import { type NotificationCategory } from '../domain/notification.types';

import { notificationRepository } from '../repositories/notification.repository';
import { randomUUID } from 'crypto';

/**
 * Creates a notification for a specific user.
 * This is the single entry point for all feature modules to generate notifications.
 * @deprecated - Migrate to emitting Domain Events instead.
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    // Map legacy type to new Category
    let category: NotificationCategory = 'SYSTEM';
    if (
      params.type === NotificationType.NEW_MESSAGE ||
      params.type === NotificationType.HOST_RESPONSE
    )
      category = 'MESSAGING';
    if (params.type.includes('BOOKING')) category = 'BOOKING';
    if (params.type.includes('STAY')) category = 'STAY';
    if (params.type.includes('REVIEW')) category = 'REVIEW';

    await notificationRepository.create({
      recipientId: params.userId,
      category,
      eventType: params.type,
      entityType: 'LEGACY',
      entityId: undefined, // no easy way to extract
      metadata: {},
      title: params.title,
      message: params.message,
      actionPath: params.link,
      sourceEventId: randomUUID(), // Temporary fix since we don't have a real source event here
    });
  } catch (error) {
    console.error('Failed to create legacy notification:', error);
  }
}

export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  conversationId: string
) {
  return createNotification({
    userId: recipientId,
    type: NotificationType.NEW_MESSAGE,
    title: 'New Message',
    message: `You received a new message from ${senderName}.`,
    link: `/users/inbox/${conversationId}`,
  });
}

export async function notifyBookingRequest(
  hostId: string,
  listingTitle: string
) {
  return createNotification({
    userId: hostId,
    type: NotificationType.BOOKING_REQUEST,
    title: 'New Booking Request',
    message: `You have a new request for ${listingTitle}.`,
    link: '/host/stays',
  });
}

export async function notifyBookingApproved(
  guestId: string,
  listingTitle: string
) {
  return createNotification({
    userId: guestId,
    type: NotificationType.BOOKING_APPROVED,
    title: 'Booking Approved!',
    message: `Your booking request for ${listingTitle} was approved.`,
    link: '/users',
  });
}

export async function notifyBookingRejected(
  guestId: string,
  listingTitle: string
) {
  return createNotification({
    userId: guestId,
    type: NotificationType.BOOKING_REJECTED,
    title: 'Booking Declined',
    message: `Your booking request for ${listingTitle} was declined.`,
    link: '/users',
  });
}

export async function notifyBookingCancelled(
  hostId: string,
  listingTitle: string
) {
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
    message:
      'We are thrilled to have you here. Complete your profile to get started.',
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

import {
  getNotification,
  getMyNotifications,
  markRead,
  markAllRead,
} from './notification.actions';

export {
  getNotification as getNotificationById,
  getMyNotifications,
  markRead,
  markAllRead,
};
