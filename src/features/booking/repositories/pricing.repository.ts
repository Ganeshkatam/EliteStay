import { createStaticClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';
import { ResourceNotFoundError } from '@/lib/domain/errors';

export interface BookingPricingContext {
  basePrice: number;
  cleaningFee: number;
}

export class PricingRepository {
  /**
   * Fetches the current live pricing for a property.
   * This is snapshotted immediately during the booking flow.
   */
  static async getLivePricing(
    propertyId: string
  ): Promise<BookingPricingContext> {
    return observeRepository(
      'PricingRepository',
      'getLivePricing',
      'listings',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listing_prices')
          .select('amount')
          .eq('listing_id', propertyId)
          .single();

        if (error || !data) {
          throw new ResourceNotFoundError(
            `Pricing details not found for property ${propertyId}`
          );
        }

        return {
          basePrice: Number(data.amount),
          cleaningFee: 0,
        };
      }
    );
  }
}
