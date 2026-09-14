import { createClient } from '@/lib/supabase/server';
import {
  NotificationRow,
  NotificationPayload,
} from '../domain/notification.types';

export class NotificationRepository {
  public async create(payload: NotificationPayload): Promise<NotificationRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.recipientId,
        category: payload.category,
        event_type: payload.eventType,
        entity_type: payload.entityType || null,
        entity_id: payload.entityId || null,
        metadata: payload.metadata || {},
        title: payload.title,
        message: payload.message,
        action_path: payload.actionPath || null,
        source_event_id: payload.sourceEventId,
      })
      .select()
      .single();

    if (error) {
      // If it's a unique constraint violation on (source_event_id, user_id), it means idempotency kicked in.
      // We should ideally fetch and return the existing notification in that case, but for now throwing is safer.
      throw new Error(`Failed to insert notification: ${error.message}`);
    }

    return data as NotificationRow;
  }

  public async findForUser(
    userId: string,
    limit = 50
  ): Promise<NotificationRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data as NotificationRow[];
  }

  public async getUnreadCount(userId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw new Error(`Failed to count unread notifications: ${error.message}`);
    }

    return count || 0;
  }

  public async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }
}

export const notificationRepository = new NotificationRepository();
