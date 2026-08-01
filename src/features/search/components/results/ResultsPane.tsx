'use client';

import { useSearchData } from '../../context/SearchProvider';
import { ResultsHeader } from './ResultsHeader';
import { ResultsActions } from './ResultsActions';
import { ListingSection } from './ListingSection';
import { SearchRecovery } from './SearchRecovery';
import { SPACING } from '@/config/spacing';

export function ResultsPane() {
  const { summary, results } = useSearchData();

  return (
    <div className="flex flex-col w-full" style={{ gap: SPACING.SEARCH_LAYOUT.resultGap }}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <ResultsHeader summary={summary} />
        <ResultsActions />
      </div>

      {results.listings.length > 0 ? (
        <ListingSection listings={results.listings} />
      ) : (
        <SearchRecovery />
      )}
    </div>
  );
}
