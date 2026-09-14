'use client';

import { useSearchData, useSearchUI } from '../../context/SearchProvider';
import { ResultsHeader } from './ResultsHeader';
import { ResultsActions } from './ResultsActions';
import { ListingSection } from './ListingSection';
import { SearchRecovery } from './SearchRecovery';
import { SPACING } from '@/config/spacing';

export function ResultsPane() {
  const { summary, results } = useSearchData();
  const { viewMode } = useSearchUI();

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      {/* Fixed top header & actions bar: stays fixed while results scroll underneath */}
      <div className="shrink-0 flex flex-row items-center justify-between gap-2 pb-3 pt-1 border-b border-gray-100 bg-white z-10">
        <ResultsHeader summary={summary} />
        <ResultsActions />
      </div>

      {/* Independent scrollable results container: ONLY the results move */}
      <div
        className={`flex-1 overflow-y-auto pt-4 no-scrollbar pr-1 flex flex-col ${
          results.listings.length === 0 ? 'justify-center items-center' : ''
        }`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACING.SEARCH_LAYOUT.resultGap,
        }}
      >
        {results.listings.length > 0 ? (
          <ListingSection listings={results.listings} viewMode={viewMode} />
        ) : (
          <SearchRecovery />
        )}
      </div>
    </div>
  );
}
