'use client';

import { LAYOUT } from '@/config/layout';
import { ToolbarRenderer } from './ToolbarRenderer';

export function SearchToolbar() {
  return (
    <div 
      className="sticky z-40 bg-white border-b border-gray-100 flex items-center shadow-sm"
      style={{ 
        top: LAYOUT.HEADER_HEIGHT,
        height: 64, // From spacing.ts toolbarHeight conceptually
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
        <ToolbarRenderer />
      </div>
    </div>
  );
}
