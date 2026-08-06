import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyPricing {
  amount: number;
  currency: string;
  billingPeriod: string;
  securityDeposit: number;
  maintenanceFee: number;
  maintenanceFeePeriod: string;
  minimumDuration: number;
  maximumDuration: number | null;
}

export class PricingService {
  static async getPricing(publicId: string): Promise<PropertyPricing | null> {
    const data = await fetchWithCache({
      key: CacheKeys.propertyPricing(publicId),
      ttl: TTL.PROPERTY_PRICING,
      negativeTtl: TTL.NEGATIVE_404,
      fetcher: async () => {
        const raw = await PropertyRepository.getPricing(publicId);
        if (!raw) return null;

        return {
          amount: Number(raw.amount),
          currency: raw.currency,
          billingPeriod: raw.billing_period,
          securityDeposit: Number(raw.security_deposit || 0),
          maintenanceFee: Number(raw.maintenance_fee || 0),
          maintenanceFeePeriod: raw.maintenance_fee_period,
          minimumDuration: raw.minimum_duration || 1,
          maximumDuration: raw.maximum_duration,
        };
      },
    });

    return data;
  }
}
