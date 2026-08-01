'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { useSearchData } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export function PriceDropdown() {
  const { filters, summary, results } = useSearchData();
  const { updateFilters } = useSearchUrl(filters);
  const [open, setOpen] = useState(false);

  const active =
    (filters.minPrice !== null && filters.minPrice !== undefined) ||
    (filters.maxPrice !== null && filters.maxPrice !== undefined);

  // Label formatting
  let label = 'Price';
  if (active) {
    const min = filters.minPrice;
    const max = filters.maxPrice;
    if (
      min !== null &&
      min !== undefined &&
      max !== null &&
      max !== undefined
    ) {
      label = `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    } else if (min !== null && min !== undefined) {
      label = `₹${min.toLocaleString('en-IN')}+`;
    } else if (max !== null && max !== undefined) {
      label = `Up to ₹${max.toLocaleString('en-IN')}`;
    }
  }

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
        className="w-96 p-5 rounded-3xl bg-white shadow-xl border border-gray-100/80 z-50 focus:outline-none"
      >
        {open && (
          <PriceDropdownContent
            filters={filters}
            updateFilters={updateFilters}
            summary={summary}
            results={results}
            onClose={() => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

interface PriceDropdownContentProps {
  filters: ReturnType<typeof useSearchData>['filters'];
  updateFilters: ReturnType<typeof useSearchUrl>['updateFilters'];
  summary: ReturnType<typeof useSearchData>['summary'];
  results: ReturnType<typeof useSearchData>['results'];
  onClose: () => void;
}

function PriceDropdownContent({
  filters,
  updateFilters,
  summary,
  results,
  onClose,
}: PriceDropdownContentProps) {
  // Initialize state directly from current filters upon mounting/opening the Popover
  const [minPrice, setMinPrice] = useState(() =>
    filters.minPrice !== null && filters.minPrice !== undefined
      ? String(filters.minPrice)
      : ''
  );
  const [maxPrice, setMaxPrice] = useState(() =>
    filters.maxPrice !== null && filters.maxPrice !== undefined
      ? String(filters.maxPrice)
      : ''
  );

  // Extract listing prices dynamically to calculate limits
  const prices = (results?.listings ?? [])
    .map((l) => l.pricing?.amount)
    .filter((p): p is number => typeof p === 'number' && p > 0);

  const minLimit = prices.length > 0 ? Math.min(...prices) : 1000;
  let maxLimit = prices.length > 0 ? Math.max(...prices) : 30000;
  if (minLimit === maxLimit) {
    maxLimit = minLimit + 10000;
  }

  const handleApply = () => {
    const minVal = minPrice.trim() !== '' ? parseInt(minPrice, 10) : null;
    const maxVal = maxPrice.trim() !== '' ? parseInt(maxPrice, 10) : null;

    updateFilters({
      minPrice: Number.isNaN(minVal) ? null : minVal,
      maxPrice: Number.isNaN(maxVal) ? null : maxVal,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    updateFilters({
      minPrice: null,
      maxPrice: null,
    });
    onClose();
  };

  // Mock histogram parameters
  const BINS = 36;
  const binWidth = (maxLimit - minLimit) / BINS;
  const Heights = [
    12, 16, 24, 35, 48, 62, 75, 88, 95, 100, 92, 85, 76, 68, 55, 48, 42, 38, 32,
    28, 24, 20, 18, 15, 12, 10, 8, 7, 5, 4, 3, 2, 2, 1, 1, 1,
  ];

  const stayCount = summary?.total ?? 0;
  const applyButtonText = stayCount > 0 ? `Show ${stayCount} stays` : 'Apply';

  // Slider synchronization values
  const sliderMin =
    minPrice !== ''
      ? Math.max(minLimit, Math.min(maxLimit, Number(minPrice)))
      : minLimit;
  const sliderMax =
    maxPrice !== ''
      ? Math.max(minLimit, Math.min(maxLimit, Number(maxPrice)))
      : maxLimit;

  const handleSliderChange = (val: number[]) => {
    setMinPrice(String(val[0]));
    setMaxPrice(String(val[1]));
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="text-sm font-semibold text-gray-900 block">
          Price range
        </span>
        <p className="text-xs text-gray-500 mt-0.5">
          Stays with matching monthly prices
        </p>
      </div>

      {/* Histogram & range slider wrapper */}
      <div className="space-y-1 py-2">
        {/* Histogram distribution visualization */}
        <div className="flex items-end gap-[3px] h-14 w-full px-2">
          {Heights.map((height, idx) => {
            const binPrice = minLimit + idx * binWidth;
            const currentMin = minPrice !== '' ? Number(minPrice) : minLimit;
            const currentMax = maxPrice !== '' ? Number(maxPrice) : maxLimit;
            const isHighlighted =
              binPrice >= currentMin && binPrice <= currentMax;

            return (
              <div
                key={idx}
                className={cn(
                  'flex-1 rounded-t-[1px] transition-colors duration-200',
                  isHighlighted ? 'bg-slate-900' : 'bg-gray-200/80'
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Range Slider Overlay */}
        <div className="px-2">
          <Slider
            min={minLimit}
            max={maxLimit}
            step={Math.max(100, Math.round((maxLimit - minLimit) / 100))}
            value={[sliderMin, sliderMax]}
            onValueChange={handleSliderChange}
            className="mt-1"
          />
        </div>
      </div>

      {/* Input text fields */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative border border-gray-200 rounded-2xl px-3.5 py-1.5 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all duration-150">
          <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
            Minimum
          </label>
          <div className="flex items-center mt-0.5">
            <span className="text-sm text-gray-500 mr-1 font-medium">₹</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={String(minLimit)}
              className="w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="text-gray-300 text-sm">—</div>
        <div className="flex-1 relative border border-gray-200 rounded-2xl px-3.5 py-1.5 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all duration-150">
          <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
            Maximum
          </label>
          <div className="flex items-center mt-0.5">
            <span className="text-sm text-gray-500 mr-1 font-medium">₹</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={String(maxLimit)}
              className="w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-gray-500 hover:text-gray-950 underline transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition-colors shadow-sm"
        >
          {applyButtonText}
        </button>
      </div>
    </div>
  );
}
