'use strict';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { notificationRepository } from '../repositories/notification.repository';
import { NotificationRow } from '../domain/notification.types';

export async function getNotification(
  id: string
): Promise<NotificationRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching notification:', error);
    return null;
  }

  return data as NotificationRow;
}

export async function getMyNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  return await notificationRepository.findForUser(user.id);
}

export async function markRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  await notificationRepository.markAsRead(notificationId, user.id);
  revalidatePath('/users/notifications');
}

export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  await notificationRepository.markAllAsRead(user.id);
  revalidatePath('/users/notifications');
}
