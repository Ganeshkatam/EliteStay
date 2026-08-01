import { SearchFilters } from '../lib/search-params';

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
    _filters: SearchFilters | Record<string, unknown>
  ): Promise<RecoveryViewModel> {
    return {
      nearbyLocalities: [],
      suggestedCities: ['Bangalore', 'Mumbai', 'Delhi', 'Pune'],
      popularSearches: ['PGs under ₹10,000', 'Fully furnished apartments'],
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
