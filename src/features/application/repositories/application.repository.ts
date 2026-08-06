import { createStaticClient } from '@/lib/supabase/server';
import {
  RentalApplication,
  RentalApplicationStatus,
} from '../types/application.types';

export class ApplicationRepository {
  /**
   * Retrieves an application by ID.
   */
  static async getById(id: string): Promise<RentalApplication | null> {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('rental_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      propertyId: data.property_id,
      guestId: data.guest_id,
      status: data.status as RentalApplicationStatus,
      moveInDate: data.move_in_date,
      leaseDurationMonths: data.lease_duration_months,
      applicantProfileId: data.applicant_profile_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Creates a new application.
   */
  static async create(
    application: Omit<
      RentalApplication,
      'id' | 'createdAt' | 'updatedAt' | 'status'
    >
  ): Promise<RentalApplication> {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('rental_applications')
      .insert({
        property_id: application.propertyId,
        guest_id: application.guestId,
        move_in_date: application.moveInDate,
        lease_duration_months: application.leaseDurationMonths,
        applicant_profile_id: application.applicantProfileId,
        status: 'DRAFT' as RentalApplicationStatus,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }

    return this.getById(data.id) as Promise<RentalApplication>;
  }

  /**
   * Updates an application status.
   */
  static async updateStatus(
    id: string,
    status: RentalApplicationStatus
  ): Promise<void> {
    const supabase = createStaticClient();
    const { error } = await supabase
      .from('rental_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }
}
