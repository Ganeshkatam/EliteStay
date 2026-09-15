'use client';

import { useSearchData, useSearchUI } from '../../context/SearchProvider';
import { ResultsHeader } from './ResultsHeader';
import { ResultsActions } from './ResultsActions';
import { ListingSection } from './ListingSection';
import { SearchRecovery } from './SearchRecovery';
import { SPACING } from '@/config/spacing';

export function ResultsPane() {
  const { summary, results } = useSearchData();
  const { viewMode, isSearching } = useSearchUI();

  return (
    <div className="relative flex flex-col w-full h-full min-h-0">
      {/* Top Animated Progress Bar on Active Search */}
      {isSearching && (
        <div className="absolute top-0 left-0 right-0 h-1 z-30 overflow-hidden bg-blue-50/50">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Fixed top header & actions bar: stays fixed while results scroll underneath */}
      <div className="shrink-0 flex flex-row items-center justify-between gap-2 pb-3 pt-1 border-b border-gray-100 bg-white z-10">
        <ResultsHeader summary={summary} />
        <ResultsActions />
      </div>

      {/* Independent scrollable results container */}
      <div
        className={`flex-1 overflow-y-auto pt-4 no-scrollbar pr-1 flex flex-col relative ${
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
