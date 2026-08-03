import { Database } from '@/types/database.types';

type ListingAvailabilityRow =
  Database['public']['Tables']['listing_availability']['Row'];

export class OccupancyPolicy {
  static isValid(availability: ListingAvailabilityRow | null): {
    isValid: boolean;
    reason?: string;
  } {
    if (!availability) {
      return { isValid: false, reason: 'Availability data is missing.' };
    }

    if (availability.available_units <= 0) {
      return {
        isValid: false,
        reason: 'There are no units available right now.',
      };
    }

    return { isValid: true };
  }
}
