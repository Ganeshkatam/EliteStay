import { createClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';
import { RentalApplication, BookingIntent } from '../types/booking.types';

export class RentalApplicationRepository {
  /**
   * Creates a new rental application from a booking intent
   */
  static async createApplication(
    guestId: string,
    intent: BookingIntent
  ): Promise<RentalApplication> {
    return observeRepository(
      'RentalApplicationRepository',
      'createApplication',
      'rental_applications',
      async () => {
        const supabase = await createClient();

        const { data, error } = await supabase
          .from('rental_applications')
          .insert({
            property_id: intent.propertyId,
            guest_id: guestId,
            status: 'DRAFT',
            move_in_date: intent.moveInDate,
            lease_duration_months: intent.leaseDurationMonths,
            monthly_budget: intent.qualifications?.monthlyBudget,
            employment_status: intent.qualifications?.employmentStatus,
            student_status: intent.qualifications?.studentStatus,
            income_range: intent.qualifications?.incomeRange,
            pet_information: intent.qualifications?.petInformation,
            guarantor_information: intent.qualifications?.guarantorInformation,
            smoking_preference: intent.qualifications?.smokingPreference,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(
            `Failed to create rental application: ${error?.message || 'Unknown error'}`
          );
        }

        return this.mapToDomain(data);
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToDomain(row: any): RentalApplication {
    return {
      id: row.id,
      propertyId: row.property_id,
      guestId: row.guest_id,
      status: row.status,
      moveInDate: row.move_in_date,
      leaseDurationMonths: row.lease_duration_months,
      monthlyBudget: row.monthly_budget,
      employmentStatus: row.employment_status,
      studentStatus: row.student_status,
      incomeRange: row.income_range,
      petInformation: row.pet_information,
      guarantorInformation: row.guarantor_information,
      smokingPreference: row.smoking_preference,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
