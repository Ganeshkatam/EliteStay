'use client';

import { SearchSummary } from '../../types';

interface ResultsHeaderProps {
  summary: SearchSummary;
}

export function ResultsHeader({ summary }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
        {summary.title}
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-medium text-gray-500">
          {summary.subtitle}
        </span>
      </div>
    </div>
  );
}
