'use client';

import { LAYOUT } from '@/config/layout';
import { SPACING } from '@/config/spacing';
import { SearchMapWorkspace } from './SearchMapWorkspace';

export function MapPane() {
  return (
    <div
      className="sticky w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-md bg-gray-100 relative"
      style={{
        top: LAYOUT.HEADER_HEIGHT + SPACING.SEARCH_LAYOUT.toolbarHeight + 24, // Keep it nicely sticky below the header and toolbar
        borderRadius: SPACING.SEARCH_LAYOUT.mapRadius
      }}
    >
      <SearchMapWorkspace />
    </div>
  );
}
