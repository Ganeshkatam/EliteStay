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
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-6 h-full overflow-y-auto">
        {resultsPane}
      </div>
    );
  }

  if (viewMode === SearchViewMode.MAP) {
    return (
      <>
        {/* Map view strictly available only on >= 1000px */}
        <div className="hidden min-[1000px]:flex w-full flex-1 relative h-full">
          {mapPane}
        </div>
        {/* Fallback to full listings grid on viewports < 1000px */}
        <div className="flex min-[1000px]:hidden w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-6 h-full overflow-y-auto">
          {resultsPane}
        </div>
      </>
    );
  }

  // SPLIT Mode
  return (
    <div
      className="w-full h-full flex flex-col min-[1000px]:flex-row items-stretch px-4 sm:px-6 md:px-8 xl:px-12 py-6 overflow-hidden"
      style={{ gap: SPACING.SEARCH_LAYOUT.panelPadding }}
    >
      {/* Results Pane: 100% on < 1000px, ~60% on >= 1000px */}
      <div className="w-full min-[1000px]:w-[64%] xl:w-[60%] 2xl:w-[58%] flex-shrink-0 h-full overflow-hidden pr-2">
        {resultsPane}
      </div>

      {/* Map Pane: Strictly hidden on viewports < 1000px */}
      <div className="hidden min-[1000px]:flex flex-1 min-w-0 h-full sticky top-0 self-start">
        {mapPane}
      </div>
    </div>
  );
}
