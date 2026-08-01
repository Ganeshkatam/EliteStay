'use client';

import React from 'react';
import { SearchViewMode } from '../../types';
import { SPACING } from '@/config/spacing';

interface SearchLayoutProps {
  viewMode: SearchViewMode;
  children: [React.ReactNode, React.ReactNode]; // [ResultsPane, MapPane]
}

export function SearchLayout({ viewMode, children }: SearchLayoutProps) {
  const [resultsPane, mapPane] = children;

  // View mode logic:
  // SPLIT: Results left, Map right (sticky)
  // LIST: Results center, Map hidden
  // MAP: Map fullscreen, Results hidden/overlay

  if (viewMode === SearchViewMode.LIST) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 h-full overflow-y-auto">
        {resultsPane}
      </div>
    );
  }

  if (viewMode === SearchViewMode.MAP) {
    return <div className="w-full flex-1 relative flex h-full">{mapPane}</div>;
  }

  // SPLIT Mode
  return (
    <div
      className="w-full h-full flex flex-col lg:flex-row items-stretch px-4 sm:px-6 lg:px-8 py-6 overflow-hidden"
      style={{ gap: SPACING.SEARCH_LAYOUT.panelPadding }}
    >
      {/* Results Pane: Takes roughly 60% on XL (scrollable) */}
      <div className="w-full lg:w-[64%] xl:w-[60%] 2xl:w-[58%] flex-shrink-0 h-full overflow-y-auto pr-2">
        {resultsPane}
      </div>

      {/* Map Pane: Takes the remaining width (fills layout height) */}
      <div className="hidden lg:flex flex-1 min-w-0 h-full">{mapPane}</div>
    </div>
  );
}
