'use client';

import { SearchSummary } from '../../types';
import { useSearchUI } from '../../context/SearchProvider';
import { Loader2 } from 'lucide-react';

interface ResultsHeaderProps {
  summary: SearchSummary;
}

export function ResultsHeader({ summary }: ResultsHeaderProps) {
  const { isSearching } = useSearchUI();

  return (
    <div className="flex flex-col min-w-0 pr-2">
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-snug line-clamp-1 sm:line-clamp-none">
          {summary.title}
        </h1>
        {isSearching && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/70 animate-pulse shrink-0">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            <span>Updating...</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
        <span className="text-xs sm:text-sm font-medium text-gray-500">
          {isSearching ? 'Fetching residences...' : summary.subtitle}
        </span>
      </div>
    </div>
  );
}
