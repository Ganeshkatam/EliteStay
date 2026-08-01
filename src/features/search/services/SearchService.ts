import { searchListings } from '@/features/listings/api/queries';
import { SearchFilters } from '../lib/search-params';
import { ListingCardData } from '@/features/listings/types';

export interface SearchResult {
  listings: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
}

export class SearchService {
  static async search(filters: SearchFilters): Promise<SearchResult> {
    const { data: listings, total, page, totalPages } = await searchListings(filters);
    return { listings, total, page, totalPages };
  }
}
