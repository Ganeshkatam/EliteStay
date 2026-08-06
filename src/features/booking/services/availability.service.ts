import { AvailabilityRepository } from '../repositories/availability.repository';
import { observeService } from '@/lib/observability/decorators/observe-service';
import { addMonths, parseISO, format } from 'date-fns';

export class AvailabilityService {
  /**
   * Pre-checkout availability check.
   */
  static async validateAvailability(
    propertyId: string,
    moveInDate: string,
    leaseDurationMonths: number
  ): Promise<boolean> {
    return observeService(
      'AvailabilityService',
      'validateAvailability',
      async () => {
        // Calculate end date for legacy availability check
        const checkIn = moveInDate;
        const checkOutDate = addMonths(
          parseISO(moveInDate),
          leaseDurationMonths
        );
        const checkOut = format(checkOutDate, 'yyyy-MM-dd');

        return AvailabilityRepository.checkAvailability(
          propertyId,
          checkIn,
          checkOut
        );
      }
    );
  }
}
