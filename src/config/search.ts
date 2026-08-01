/**
 * Search-specific constants
 */
export const SEARCH_CONSTANTS = {
  MapZoom: {
    DEFAULT: 12,
    CITY: 10,
    LOCALITY: 14,
    STREET: 16
  },
  MaxFilters: 10,
  DefaultSort: 'relevance',
  DefaultView: 'SPLIT',
  PaginationSize: 20
} as const;
