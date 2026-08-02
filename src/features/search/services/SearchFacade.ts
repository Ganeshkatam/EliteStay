import { SearchFilters } from '../lib/search-params';
import { SearchPageViewModel, SearchSummary } from '../types';
import { SearchService } from './SearchService';
import { DiscoveryService } from './DiscoveryService';
import { LocationInsightsService } from './LocationInsightsService';
import { MapService } from './MapService';

export class SearchFacade {
  static async getPageData(
    filters: SearchFilters
  ): Promise<SearchPageViewModel> {
    const searchResult = await SearchService.search(filters);
    const insights = await LocationInsightsService.getInsights(
      filters.city ?? undefined
    );
    const mapData = await MapService.getMapData(searchResult.listings, filters);
    const recoveryData = await DiscoveryService.getRecoveryData(filters);

    // Compute dynamic title based on filters
    let title = 'Stays';
    if (filters.accommodationType && filters.accommodationType !== 'all') {
      title =
        filters.accommodationType === 'pg'
          ? 'PGs'
          : filters.accommodationType === 'apartment'
            ? 'Apartments'
            : filters.accommodationType === 'independent-house'
              ? 'Independent Houses'
              : filters.accommodationType === 'villa'
                ? 'Villas'
                : filters.accommodationType === 'hostel'
                  ? 'Hostels'
                  : 'Stays';
    }

    const isViewportSearch = filters.minLat != null && filters.maxLat != null;

    if (filters.locality) {
      title += ` in ${filters.locality}`;
      if (filters.city) {
        title += `, ${filters.city}`;
      }
    } else if (filters.city) {
      title += ` in ${filters.city}`;
    } else if (isViewportSearch) {
      title += ' in this map area';
    } else {
      title += ' to explore';
    }

    const summary: SearchSummary = {
      title,
      subtitle:
        searchResult.total === 1 ? '1 stay' : `${searchResult.total} stays`,
      total: searchResult.total,
      updatedAt: new Date(),
    };

    return {
      metadata: {
        title: `${summary.title} | EliteStay`,
        description: `Find ${summary.title.toLowerCase()} on EliteStay. Compare amenities, prices, and locations.`,
        canonical: `/s`,
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: summary.title, href: '/s' },
        ],
      },
      workspace: {
        summary,
        filters,
        results: {
          listings: searchResult.listings,
          pagination: {
            currentPage: searchResult.page,
            totalPages: searchResult.totalPages,
            hasMore: searchResult.page < searchResult.totalPages,
          },
        },
        map: mapData,
        insights,
        recovery: recoveryData,
      },
    };
  }
}
