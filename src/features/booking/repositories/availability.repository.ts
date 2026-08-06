import { createStaticClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AvailabilityConflictError } from '@/lib/domain/errors';

export class AvailabilityRepository {
  /**
   * Checks if a property is available for the given dates.
   * Note: During checkout, rely on `BookingRepository.createReservationSafe`
   * which does this atomically within a transaction.
   * This method is useful for pre-checkout validation.
   */
  static async checkAvailability(
    propertyId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    return observeRepository(
      'AvailabilityRepository',
      'checkAvailability',
      'reservations',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase.rpc('check_availability', {
          p_property_id: propertyId,
          p_check_in: checkIn,
          p_check_out: checkOut,
        });

        if (error) {
          throw new Error(`Failed to check availability: ${error.message}`);
        }

        return data as boolean;
      }
    );
  }
}
