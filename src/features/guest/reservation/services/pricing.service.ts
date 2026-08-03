import { Database } from '@/types/database.types';
import { PriceQuote } from '../types/reservation.types';
import { PricingPolicy } from '../policies/pricing.policy';

type ListingPricingRow = Database['public']['Tables']['listing_prices']['Row'];

export class PricingService {
  /**
   * Generates a PriceQuote for the given duration.
   */
  static getQuote(
    pricing: ListingPricingRow | null,
    duration: number | null
  ): PriceQuote | null {
    return PricingPolicy.calculateQuote(pricing, duration);
  }
}
