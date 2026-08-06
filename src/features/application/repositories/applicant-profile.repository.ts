import { createStaticClient } from '@/lib/supabase/server';
import { ApplicantProfile } from '../types/application.types';

export class ApplicantProfileRepository {
  static async getByGuestId(guestId: string): Promise<ApplicantProfile | null> {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('applicant_profiles')
      .select('*')
      .eq('guest_id', guestId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      guestId: data.guest_id,
      employmentStatus: data.employment_status,
      studentStatus: data.student_status,
      incomeRange: data.income_range,
      petInformation: data.pet_information,
      guarantorInformation: data.guarantor_information,
      smokingPreference: data.smoking_preference,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async upsert(
    profile: Omit<ApplicantProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApplicantProfile> {
    const supabase = createStaticClient();

    // Check if exists first for guest_id
    const existing = await this.getByGuestId(profile.guestId);

    const { data, error } = await supabase
      .from('applicant_profiles')
      .upsert(
        {
          id: existing?.id, // if undefined, Supabase will generate a new UUID
          guest_id: profile.guestId,
          employment_status: profile.employmentStatus,
          student_status: profile.studentStatus,
          income_range: profile.incomeRange,
          pet_information: profile.petInformation,
          guarantor_information: profile.guarantorInformation,
          smoking_preference: profile.smokingPreference,
        },
        { onConflict: 'guest_id' }
      )
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to upsert applicant profile: ${error.message}`);
    }

    return this.getByGuestId(profile.guestId) as Promise<ApplicantProfile>;
  }
}
