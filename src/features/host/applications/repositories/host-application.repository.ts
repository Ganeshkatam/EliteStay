import { createClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';

export class HostApplicationRepository {
  static async getPendingApplicationsForHost(hostId: string) {
    return observeRepository(
      'HostApplicationRepository',
      'getPendingApplicationsForHost',
      'rental_applications',
      async () => {
        const supabase = await createClient();

        // We need to fetch applications where the property is owned by the hostId
        // First, get host's listings
        const { data: listings, error: listingError } = await supabase
          .from('listings')
          .select('public_id')
          .eq('host_id', hostId);

        if (listingError || !listings || listings.length === 0) {
          return [];
        }

        const listingIds = listings.map((l) => l.public_id);

        // Now fetch applications for these listings
        const { data, error } = await supabase
          .from('rental_applications')
          .select(
            `
          id,
          status,
          move_in_date,
          lease_duration_months,
          created_at,
          property_id,
          guest_id,
          applicant_profiles (
            employment_status,
            income_range,
            student_status,
            pet_information,
            guarantor_information
          ),
          listings!rental_applications_property_id_fkey (
            title,
            cover_image
          ),
          guest:guest_id (
            first_name,
            last_name,
            avatar_url
          )
        `
          )
          .in('property_id', listingIds)
          .eq('status', 'UNDER_REVIEW')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch applications: ${error.message}`);
        }

        return data;
      }
    );
  }
}
