export interface SearchQuery {
  term: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
