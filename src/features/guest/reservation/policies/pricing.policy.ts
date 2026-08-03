import { Database } from '@/types/database.types';
import { PriceQuote } from '../types/reservation.types';

type ListingPricingRow = Database['public']['Tables']['listing_prices']['Row'];

export class PricingPolicy {
  /**
   * Generates an immutable PriceQuote.
   * Total upfront = (Rent * duration) + Security Deposit + Prorated Maintenance Fee + Platform Fee
   */
  static calculateQuote(
    pricing: ListingPricingRow | null,
    duration: number | null
  ): PriceQuote | null {
    if (!pricing || !duration) return null;

    const rent = pricing.amount;
    const baseTotal = rent * duration;
    const deposit = pricing.security_deposit || 0;

    // Simplistic prorated maintenance fee for demonstration
    // If it's a monthly fee, it scales with duration.
    // If it's yearly, it's (fee / 12) * duration.
    let maintenanceFee = 0;
    if (pricing.maintenance_fee) {
      if (pricing.maintenance_fee_period === 'month') {
        maintenanceFee = pricing.maintenance_fee * duration;
      } else if (pricing.maintenance_fee_period === 'year') {
        maintenanceFee = (pricing.maintenance_fee / 12) * duration;
      } else {
        // Assuming null or other period means one-time
        maintenanceFee = pricing.maintenance_fee;
      }
    }

    // Platform fee (e.g. 5% of base rent total)
    const platformFee = Math.round(baseTotal * 0.05);

    const totalUpfront = baseTotal + deposit + maintenanceFee + platformFee;

    const now = new Date();
    // Quote is valid for 15 minutes
    const expires = new Date(now.getTime() + 15 * 60000);

    return {
      rent: baseTotal,
      deposit,
      maintenanceFee,
      platformFee,
      totalUpfront,
      generatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
  }
}
