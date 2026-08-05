import { searchListings } from '@/features/listings/api/queries';
import { SearchFilters } from '../lib/search-params';
import { ListingCardData } from '@/features/listings/types';
import { fetchWithCache, CacheKeys, TTL, CacheInvalidation } from '@/lib/redis';

export interface SearchResult {
  listings: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
}

export class SearchService {
  static async search(filters: SearchFilters): Promise<SearchResult> {
    // Get the current search namespace version for cache key
    const searchVersion = await CacheInvalidation.getSearchVersion();

    // Build canonical search params for cache key (exclude pagination for cache sharing)
    const cacheParams: Record<string, unknown> = {
      city: filters.city,
      locality: filters.locality,
      accommodationType: filters.accommodationType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      furnishing: filters.furnishing,
      genderPreference: filters.genderPreference,
      occupancyType: filters.occupancyType,
      billingPeriod: filters.billingPeriod,
      amenities: filters.amenities,
      availableFrom: filters.availableFrom,
      sort: filters.sort,
      page: filters.page,
      pageSize: filters.pageSize,
    };

    const result = await fetchWithCache<SearchResult>({
      key: CacheKeys.searchListings(searchVersion, cacheParams),
      ttl: TTL.SEARCH,
      negativeTtl: TTL.NEGATIVE_EMPTY,
      fetcher: async () => {
        const {
          data: listings,
          total,
          page,
          totalPages,
        } = await searchListings(filters);
        return { listings, total, page, totalPages };
      },
    });

    return result || { listings: [], total: 0, page: 1, totalPages: 0 };
  }
}
