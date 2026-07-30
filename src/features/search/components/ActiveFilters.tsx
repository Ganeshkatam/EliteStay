'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchUrl } from '../hooks/useSearchUrl';
import { type SearchFilters } from '../lib/search-params';
import { Button } from '@/components/ui/button';

interface ActiveFiltersProps {
  filters: SearchFilters;
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const { removeFilter, clearFilters, isPending } = useSearchUrl(filters);

  const activeChips: { key: keyof SearchFilters; label: string }[] = [];

  if (filters.city) activeChips.push({ key: 'city', label: filters.city });
  if (filters.locality)
    activeChips.push({ key: 'locality', label: filters.locality });

  if (filters.accommodationType) {
    activeChips.push({
      key: 'accommodationType',
      label: filters.accommodationType
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(n);
    if (filters.minPrice !== null && filters.maxPrice !== null) {
      activeChips.push({
        key: 'maxPrice',
        label: `${fmt(filters.minPrice)} - ${fmt(filters.maxPrice)}`,
      });
    } else if (filters.minPrice !== null) {
      activeChips.push({
        key: 'minPrice',
        label: `From ${fmt(filters.minPrice)}`,
      });
    } else if (filters.maxPrice !== null) {
      activeChips.push({
        key: 'maxPrice',
        label: `Up to ${fmt(filters.maxPrice)}`,
      });
    }
  }

  if (filters.billingPeriod) {
    activeChips.push({
      key: 'billingPeriod',
      label: `Per ${filters.billingPeriod}`,
    });
  }

  if (filters.furnishing) {
    activeChips.push({
      key: 'furnishing',
      label: filters.furnishing
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    });
  }

  if (filters.genderPreference && filters.genderPreference !== 'any') {
    activeChips.push({
      key: 'genderPreference',
      label: filters.genderPreference === 'female' ? 'Girls Only' : 'Boys Only',
    });
  }

  if (filters.occupancyType) {
    activeChips.push({
      key: 'occupancyType',
      label: `${filters.occupancyType.charAt(0).toUpperCase()}${filters.occupancyType.slice(1)} occupancy`,
    });
  }

  // We could add individual amenities, but for now we'll add one combined chip
  // or individual chips for each amenity. Let's do individual chips.
  filters.amenities.forEach((amenity) => {
    activeChips.push({
      key: 'amenities', // It's tricky to remove just one amenity with our current removeFilter design, but let's keep it simple for V1.
      label: amenity.charAt(0).toUpperCase() + amenity.slice(1),
    });
  });

  if (filters.availableFrom) {
    activeChips.push({
      key: 'availableFrom',
      label: `From ${filters.availableFrom}`,
    });
  }

  if (activeChips.length === 0) return null;

  return (
    <div
      className={`mt-3 flex flex-wrap items-center gap-2 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {activeChips.map((chip, idx) => (
        <Badge
          key={`${chip.key}-${idx}`}
          variant="secondary"
          className="flex items-center gap-1 pl-3 pr-2 py-1 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-default"
        >
          {chip.label}
          <button
            onClick={() => removeFilter(chip.key)}
            className="ml-1 rounded-full p-0.5 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 h-7"
      >
        Clear all
      </Button>
    </div>
  );
}
