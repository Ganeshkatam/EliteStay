'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import {
  type SearchFilters,
  buildSearchUrl,
} from '@/features/search/lib/search-params';
import { useSearchUIOptional } from '../context/SearchProvider';

export function useSearchUrl(currentFilters: SearchFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const searchUI = useSearchUIOptional();
  const [localPending, localStartTransition] = useTransition();

  const isPending = searchUI ? searchUI.isSearching : localPending;
  const startTransition = searchUI
    ? searchUI.startSearchTransition
    : localStartTransition;

  /**
   * Updates the URL with the provided filters.
   * Merges with existing filters.
   */
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>, replace = false) => {
      // Build a merged filter object
      const merged: SearchFilters = { ...currentFilters, ...newFilters };

      // Generate the canonical URL
      const url = buildSearchUrl(merged, pathname);

      // Trigger transition with searching indicator
      startTransition(() => {
        if (replace) {
          router.replace(url, { scroll: false });
        } else {
          router.push(url, { scroll: false });
        }
      });
    },
    [currentFilters, pathname, router, startTransition]
  );

  /**
   * Clears all filters, reverting to the default base search URL.
   */
  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router, startTransition]);

  /**
   * Removes a specific filter by its key, reverting it to its default/null state.
   */
  const removeFilter = useCallback(
    <K extends keyof SearchFilters>(key: K) => {
      const updated = { ...currentFilters };

      // For amenities (array), reset to empty array.
      // For everything else, reset to null/default logic handled by buildSearchUrl.
      if (key === 'amenities') {
        // @ts-expect-error - TS union indexing
        updated[key] = [];
      } else if (key === 'page') {
        updated.page = 1;
      } else if (key === 'pageSize') {
        updated.pageSize = 12;
      } else if (key === 'sort') {
        updated.sort = 'recommended';
      } else {
        // @ts-expect-error - TS union indexing
        updated[key] = null;
      }

      // If we change a filter (other than page), typically we want to reset to page 1.
      if (key !== 'page') {
        updated.page = 1;
      }

      const url = buildSearchUrl(updated, pathname);
      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [currentFilters, pathname, router, startTransition]
  );

  /**
   * Helper specifically for page navigation
   */
  const goToPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  return {
    updateFilters,
    clearFilters,
    removeFilter,
    goToPage,
    isPending,
  };
}
