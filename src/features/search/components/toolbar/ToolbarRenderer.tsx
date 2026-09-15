'use client';

import { SEARCH_TOOLBAR_SCHEMA } from '../../config/toolbar';
import { SearchChip } from '../../ui/SearchChip';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchData, useSearchUI } from '../../context/SearchProvider';
import { TypeDropdown } from './TypeDropdown';
import { FurnishingDropdown } from './FurnishingDropdown';
import { GenderDropdown } from './GenderDropdown';
import { PriceDropdown } from './PriceDropdown';
import { MoreFiltersDrawer } from './MoreFiltersDrawer';

export function ToolbarRenderer() {
  const { filters } = useSearchData();
  const { setDrawerOpen } = useSearchUI();

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3 w-max py-1 pr-4 sm:pr-0">
        {SEARCH_TOOLBAR_SCHEMA.sort((a, b) => a.order - b.order).map((def) => {
          // Just as an example, rendering chips
          const isActive =
            def.id !== 'more' &&
            filters[def.id as keyof typeof filters] !== undefined &&
            filters[def.id as keyof typeof filters] !== null;

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

          if (def.id === 'price') {
            return <PriceDropdown key={def.id} />;
          }

          if (def.id === 'type') {
            return <TypeDropdown key={def.id} />;
          }

          if (def.id === 'furnishing') {
            return <FurnishingDropdown key={def.id} />;
          }

          if (def.id === 'gender') {
            return <GenderDropdown key={def.id} />;
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
      <MoreFiltersDrawer />
    </>
  );
}
