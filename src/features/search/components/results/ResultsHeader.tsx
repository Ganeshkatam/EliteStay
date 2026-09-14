'use client';

import { SearchSummary } from '../../types';

interface ResultsHeaderProps {
  summary: SearchSummary;
}

export function ResultsHeader({ summary }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col min-w-0 pr-2">
      <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-snug line-clamp-1 sm:line-clamp-none">
        {summary.title}
      </h1>
      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
        <span className="text-xs sm:text-sm font-medium text-gray-500">
          {summary.subtitle}
        </span>
      </div>
    </div>
  );
}
