import { createStaticClient } from '@/lib/supabase/server';
import { ViewingRequest, ViewingRequestStatus } from '../types/viewing.types';

export class ViewingRequestRepository {
  static async create(
    data: Omit<ViewingRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ViewingRequest> {
    const supabase = createStaticClient();
    const { data: row, error } = await supabase
      .from('viewing_requests')
      .insert({
        property_id: data.propertyId,
        guest_id: data.guestId,
        requested_date: data.requestedDate,
        requested_time: data.requestedTime,
        message: data.message,
        status: 'REQUESTED' as ViewingRequestStatus,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create viewing request: ${error.message}`);
    }

    return {
      id: row.id,
      propertyId: row.property_id,
      guestId: row.guest_id,
      status: row.status as ViewingRequestStatus,
      requestedDate: row.requested_date,
      requestedTime: row.requested_time,
      message: row.message,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static async updateStatus(
    id: string,
    status: ViewingRequestStatus
  ): Promise<void> {
    const supabase = createStaticClient();
    const { error } = await supabase
      .from('viewing_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(
        `Failed to update viewing request status: ${error.message}`
      );
    }
  }
}
