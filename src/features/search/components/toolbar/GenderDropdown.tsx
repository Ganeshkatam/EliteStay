'use client';

import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { useSearchData } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { cn } from '@/lib/utils';

const genderOptions = [
  { label: 'Any', value: 'any' },
  { label: 'Boys Only', value: 'male' },
  { label: 'Girls Only', value: 'female' },
];

export function GenderDropdown() {
  const { filters } = useSearchData();
  const { updateFilters } = useSearchUrl(filters);
  const [open, setOpen] = React.useState(false);

  const selectedValue = filters.genderPreference;
  const selectedObj = genderOptions.find((t) => t.value === selectedValue);
  const label =
    selectedObj && selectedValue !== null ? selectedObj.label : 'Gender';
  const active = !!selectedValue;

  const handleSelect = (value: string) => {
    if (value === 'any' || selectedValue === value) {
      updateFilters({ genderPreference: null });
    } else {
      updateFilters({ genderPreference: value as 'any' | 'male' | 'female' });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 select-none outline-none',
            active
              ? 'border-gray-900 bg-gray-50 text-gray-900 font-semibold'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
          )}
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-gray-500 transition-transform duration-200',
              open ? 'rotate-180' : 'rotate-0'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-2 rounded-2xl bg-white shadow-lg border border-gray-100 z-50"
      >
        <div className="space-y-0.5">
          {genderOptions.map((item) => {
            const isSelected =
              selectedValue === item.value ||
              (item.value === 'any' && !selectedValue);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelect(item.value)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors duration-150',
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{item.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
