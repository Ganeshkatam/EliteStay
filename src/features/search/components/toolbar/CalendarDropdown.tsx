'use client';

import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronDown } from 'lucide-react';
import { useSearchData } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

export function CalendarDropdown() {
  const { filters } = useSearchData();
  const { updateFilters } = useSearchUrl(filters);
  const [open, setOpen] = React.useState(false);

  const selectedValue = filters.availableFrom;
  const parsedDate = selectedValue ? parseISO(selectedValue) : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const label = selectedDate ? format(selectedDate, 'dd MMM') : 'Move In';
  const active = !!selectedDate;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      updateFilters({ availableFrom: format(date, 'yyyy-MM-dd') });
    } else {
      updateFilters({ availableFrom: null });
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
        className="w-auto p-3 rounded-2xl bg-white shadow-lg border border-gray-100 z-50"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            // Disable past dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
