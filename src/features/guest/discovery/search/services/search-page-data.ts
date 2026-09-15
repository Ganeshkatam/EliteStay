import { cache } from 'react';
import { SearchFilters } from '@/features/search/lib/search-params';
import { GuestService } from '@/features/guest/services/guest.service';

/**
 * Canonically serialize SearchFilters into a deterministic primitive string.
 * This ensures React's cache() compares by primitive value rather than object identity.
 */
function serializeFilters(filters: SearchFilters): string {
  return JSON.stringify(filters, Object.keys(filters).sort());
}

/**
 * Request-scoped memoized data loader for the search page.
 * Uses a canonical primitive string key to guarantee deduplication
 * between generateMetadata() and DiscoverPage().
 */
const getSearchPageDataInternal = cache(async (serializedKey: string) => {
  const filters = JSON.parse(serializedKey) as SearchFilters;
  return GuestService.getSearchData(filters);
});

export async function getSearchPageData(filters: SearchFilters) {
  const key = serializeFilters(filters);
  return getSearchPageDataInternal(key);
}
