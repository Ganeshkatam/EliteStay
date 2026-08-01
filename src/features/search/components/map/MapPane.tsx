'use client';

import { SPACING } from '@/config/spacing';
import { SearchMapWorkspace } from './SearchMapWorkspace';

export function MapPane() {
  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden shadow-md bg-gray-100 relative"
      style={{
        borderRadius: SPACING.SEARCH_LAYOUT.mapRadius,
      }}
    >
      <SearchMapWorkspace />
    </div>
  );
}
