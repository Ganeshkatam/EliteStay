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
    _city: string | undefined
  ): Promise<LocationInsights> {
    // In V1, this returns static or softly aggregated data.
    return {
      listingCount: 1248,
      averageRent: 18400,
      medianRent: 16000,
      furnishedPercentage: 92,
      popularAreas: ['Koramangala', 'HSR Layout', 'Indiranagar'],
      updatedAt: new Date(),
    };
  }
}
