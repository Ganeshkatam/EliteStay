'use server';

import { createClient } from '@/lib/supabase/server';

interface NotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: NotificationParams) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}
