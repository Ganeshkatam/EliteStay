import { Database } from '@/types/database.types';

type ListingPricingRow = Database['public']['Tables']['listing_prices']['Row'];

export class DurationPolicy {
  static isValid(
    duration: number | null,
    pricing: ListingPricingRow | null
  ): { isValid: boolean; reason?: string } {
    if (!duration) {
      return { isValid: false, reason: 'Duration is required.' };
    }

    if (!pricing) {
      return { isValid: false, reason: 'Pricing data is missing.' };
    }

    const minDuration = pricing.minimum_duration;
    const maxDuration = pricing.maximum_duration;

    if (minDuration !== null && duration < minDuration) {
      return {
        isValid: false,
        reason: `The minimum stay is ${minDuration} month(s).`,
      };
    }

    if (maxDuration !== null && duration > maxDuration) {
      return {
        isValid: false,
        reason: `The maximum stay is ${maxDuration} month(s).`,
      };
    }

    return { isValid: true };
  }
}
