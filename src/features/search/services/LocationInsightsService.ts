import { getLocationInsightsQuery } from '@/features/listings/api/queries';

export interface LocationInsights {
  listingCount: number;
  averageRent: number;
  medianRent: number;
  furnishedPercentage: number;
  popularAreas: string[];
  updatedAt: Date;
}

export class LocationInsightsService {
  static async getInsights(
    city: string | undefined
  ): Promise<LocationInsights> {
    return getLocationInsightsQuery(city);
  }
}
