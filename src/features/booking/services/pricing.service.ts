import { PricingRepository } from '../repositories/pricing.repository';
import { PricingSnapshot, BookingIntent } from '../types/booking.types';
import { observeService } from '@/lib/observability/decorators/observe-service';

export interface CalculatedPricing {
  monthlyRent: number;
  securityDeposit: number;
  maintenanceFee: number;
  utilities: number;
  brokerageFee: number;
  totalInitialPayment: number;
  snapshot: PricingSnapshot;
}

export class PricingService {
  /**
   * Generates the immutable hybrid pricing snapshot based on live data and intent.
   */
  static async calculateAndSnapshot(
    intent: BookingIntent
  ): Promise<CalculatedPricing> {
    return observeService(
      'PricingService',
      'calculateAndSnapshot',
      async () => {
        const livePricing = await PricingRepository.getLivePricing(
          intent.propertyId
        );

        const leaseDuration = intent.leaseDurationMonths;
        if (!leaseDuration || leaseDuration <= 0)
          throw new Error('Lease duration must be greater than 0.');

        const monthlyRent = livePricing.basePrice;

        // Typical long-term fees calculation
        const securityDeposit = monthlyRent * 1.5; // Example rule: 1.5 months rent
        const maintenanceFee = 500; // Example flat fee
        const utilities = 0; // Tenant pays directly
        const brokerageFee = monthlyRent * 0.4; // Example 0.5 month fee

        // First month rent + deposit + fees
        const totalInitialPayment =
          monthlyRent + securityDeposit + maintenanceFee + brokerageFee;

        const snapshot: PricingSnapshot = {
          version: 2,
          pricingEngineVersion: 'v2-longterm',
          rules: {
            monthlyRent,
            leaseDurationMonths: leaseDuration,
            securityDepositMultiplier: 1.5,
            brokerageFeeMultiplier: 0.5,
          },
          discounts: [],
          taxes: [], // Typically no sales tax on residential rent
        };

        return {
          monthlyRent,
          securityDeposit,
          maintenanceFee,
          utilities,
          brokerageFee,
          totalInitialPayment,
          snapshot,
        };
      }
    );
  }
}
