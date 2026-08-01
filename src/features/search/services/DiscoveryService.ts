import { SearchFilters } from '../lib/search-params';
import { getDiscoverySuggestionsQuery } from '@/features/listings/api/queries';

export interface RecoveryAction {
  title: string;
  icon?: string;
  action: string;
  priority: number;
}

export interface RecoveryViewModel {
  nearbyLocalities: string[];
  suggestedCities: string[];
  popularSearches: string[];
  actions: RecoveryAction[];
}

export class DiscoveryService {
  static async getRecoveryData(
    filters: SearchFilters | Record<string, unknown>
  ): Promise<RecoveryViewModel> {
    const city =
      'city' in filters && typeof filters.city === 'string'
        ? filters.city
        : undefined;
    const suggestions = await getDiscoverySuggestionsQuery(city);

    return {
      nearbyLocalities: suggestions.nearbyLocalities,
      suggestedCities: suggestions.suggestedCities,
      popularSearches: suggestions.popularSearches,
      actions: [
        {
          title: 'Clear all filters',
          action: 'CLEAR_FILTERS',
          priority: 1,
        },
        {
          title: 'Expand search radius',
          action: 'EXPAND_RADIUS',
          priority: 2,
        },
      ],
    };
  }
}
