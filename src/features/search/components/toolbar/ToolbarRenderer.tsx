'use client';

import { SEARCH_TOOLBAR_SCHEMA } from '../../config/toolbar';
import { SearchChip } from '../../ui/SearchChip';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchData, useSearchUI } from '../../context/SearchProvider';

export function ToolbarRenderer() {
  const { filters } = useSearchData();
  const { setDrawerOpen } = useSearchUI();

  return (
    <div className="flex items-center gap-3 w-full">
      {SEARCH_TOOLBAR_SCHEMA.sort((a, b) => a.order - b.order).map((def) => {
        // Just as an example, rendering chips
        const isActive = def.id !== 'more' && filters[def.id as keyof typeof filters] !== undefined && filters[def.id as keyof typeof filters] !== null;

        if (def.id === 'more') {
          return (
            <SearchChip 
              key={def.id} 
              label={def.label} 
              icon={<SlidersHorizontal className="w-4 h-4 mr-2" />} 
              onClick={() => setDrawerOpen(true)}
              active={false}
            />
          );
        }

        return (
          <SearchChip 
            key={def.id} 
            label={def.label} 
            active={isActive}
            onClick={() => {
              // Quick filters logic or open sheet focusing on this section
              if (def.id !== 'more') {
                setDrawerOpen(true);
              }
            }}
          />
        );
      })}
    </div>
  );
}
