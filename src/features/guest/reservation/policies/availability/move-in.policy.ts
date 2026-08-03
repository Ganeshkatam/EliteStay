import { Database } from '@/types/database.types';

type ListingAvailabilityRow =
  Database['public']['Tables']['listing_availability']['Row'];

export class MoveInPolicy {
  static isValid(
    moveInDate: Date | null,
    availability: ListingAvailabilityRow | null
  ): { isValid: boolean; reason?: string } {
    if (!moveInDate) {
      return { isValid: false, reason: 'Move-in date is required.' };
    }

    if (!availability || !availability.start_date) {
      return { isValid: false, reason: 'Availability data is missing.' };
    }

    const availableFrom = new Date(availability.start_date);
    // Strip time for strict date comparison
    availableFrom.setHours(0, 0, 0, 0);

    const requestedDate = new Date(moveInDate);
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate < availableFrom) {
      return {
        isValid: false,
        reason: `Move-in date must be on or after ${availableFrom.toLocaleDateString()}.`,
      };
    }

    return { isValid: true };
  }
}
