'use client';

import { SearchSummary } from '../../types';

interface ResultsHeaderProps {
  summary: SearchSummary;
}

export function ResultsHeader({ summary }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{summary.title}</h1>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm font-medium text-gray-900">{summary.subtitle}</span>
        <span className="text-gray-400 text-sm">•</span>
        <span className="text-sm text-gray-500">Updated just now</span>
      </div>
    </div>
  );
}
