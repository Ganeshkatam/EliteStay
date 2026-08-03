import { SearchQuery, SearchResult } from '../types';

/**
 * Abstract interface for a Search engine provider.
 * Implementation is intentionally deferred until Guest Search requirements
 * (AI, semantic, map boundaries, autocomplete) are fully defined.
 */
export interface SearchProvider {
  /**
   * Indexes a document for future searching.
   */
  indexDocument(
    indexName: string,
    id: string,
    document: unknown
  ): Promise<void>;

  /**
   * Removes a document from the index.
   */
  deleteDocument(indexName: string, id: string): Promise<void>;

  /**
   * Executes a search query against an index.
   */
  search<T>(indexName: string, query: SearchQuery): Promise<SearchResult<T>>;
}
