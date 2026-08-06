import { Cache } from './facade';
import { LocationService } from '@/features/location/services/location-service';
import { getAccommodationTypes } from '@/features/guest/discovery/home/api/accommodation-type-cache';

/**
 * Cache Warmer Interface
 */
export interface CacheWarmer {
  name: string;
  run: () => Promise<void>;
}

export const homePageWarmer: CacheWarmer = {
  name: 'HomePageWarmer',
  run: async () => {
    console.log(`[CacheWarmer] Running ${homePageWarmer.name}...`);
    // 1. Warm Accommodation Types
    await getAccommodationTypes();

    // 2. Warm Featured Cities
    await LocationService.getFeaturedCities();

    console.log(`[CacheWarmer] Finished ${homePageWarmer.name}.`);
  },
};

export const cacheWarmers: CacheWarmer[] = [
  homePageWarmer,
  // Add future warmers here (e.g. search pages, popular listings)
];

export async function runAllWarmers() {
  console.log('[CacheWarmer] Starting all warmers...');
  for (const warmer of cacheWarmers) {
    try {
      await warmer.run();
    } catch (err) {
      console.error(`[CacheWarmer] Failed to run warmer ${warmer.name}`, err);
    }
  }
  console.log('[CacheWarmer] All warmers completed.');
}
