'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSearchData, useSearchUI } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { type SearchFilters } from '../../lib/search-params';
import { cn } from '@/lib/utils';
import {
  Check,
  Wifi,
  Wind,
  Utensils,
  Shirt,
  Sparkles,
  ShieldCheck,
  Dumbbell,
  Car,
  Coffee,
  Waves,
  Zap,
  Droplets,
  Users,
  BookOpen,
  Lock,
  UserCheck,
  ArrowUpDown,
  Sun,
  Trees,
  Heart,
  Flame,
  Refrigerator as RefrigeratorIcon,
} from 'lucide-react';

interface AmenityDef {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  validTypes: string[];
}

const ALL_AMENITIES: AmenityDef[] = [
  // Common / Essentials
  {
    name: 'WiFi',
    icon: Wifi,
    validTypes: [
      'all',
      'apartment',
      'pg',
      'hostel',
      'villa',
      'co-living',
      'private-room',
    ],
  },
  {
    name: 'AC',
    icon: Wind,
    validTypes: [
      'all',
      'apartment',
      'pg',
      'hostel',
      'villa',
      'co-living',
      'private-room',
    ],
  },
  {
    name: 'Power Backup',
    icon: Zap,
    validTypes: ['all', 'apartment', 'pg', 'villa', 'co-living'],
  },
  {
    name: 'CCTV',
    icon: ShieldCheck,
    validTypes: [
      'all',
      'apartment',
      'pg',
      'hostel',
      'villa',
      'co-living',
      'private-room',
    ],
  },
  {
    name: 'Security Guard',
    icon: ShieldCheck,
    validTypes: ['all', 'apartment', 'pg', 'hostel', 'villa', 'co-living'],
  },
  {
    name: 'Parking',
    icon: Car,
    validTypes: ['all', 'apartment', 'pg', 'co-living'],
  },

  // PG & Co-Living & Hostel Curations
  { name: 'Meals', icon: Utensils, validTypes: ['pg', 'hostel', 'co-living'] },
  { name: 'Mess', icon: Utensils, validTypes: ['hostel'] },
  { name: 'RO Water', icon: Droplets, validTypes: ['pg', 'co-living'] },
  {
    name: 'Laundry',
    icon: Shirt,
    validTypes: ['pg', 'hostel', 'co-living', 'private-room'],
  },
  { name: 'Housekeeping', icon: Sparkles, validTypes: ['pg', 'co-living'] },
  { name: 'Common Room', icon: Users, validTypes: ['hostel', 'co-living'] },
  {
    name: 'Study Area',
    icon: BookOpen,
    validTypes: ['hostel', 'co-living', 'pg'],
  },
  { name: 'Lockers', icon: Lock, validTypes: ['hostel', 'co-living'] },
  { name: 'Reception', icon: UserCheck, validTypes: ['hostel', 'co-living'] },

  // Apartment & Villa Curations
  {
    name: 'Kitchen',
    icon: Coffee,
    validTypes: ['apartment', 'villa', 'pg', 'co-living'],
  },
  {
    name: 'Gym',
    icon: Dumbbell,
    validTypes: ['apartment', 'villa', 'co-living'],
  },
  { name: 'Pool', icon: Waves, validTypes: ['apartment', 'villa'] },
  { name: 'Lift', icon: ArrowUpDown, validTypes: ['apartment'] },
  { name: 'Balcony', icon: Sun, validTypes: ['apartment', 'co-living'] },
  { name: 'Garden', icon: Trees, validTypes: ['villa'] },
  { name: 'Private Parking', icon: Car, validTypes: ['villa', 'apartment'] },
  { name: 'Terrace', icon: Sun, validTypes: ['villa'] },
  {
    name: 'Pet Friendly',
    icon: Heart,
    validTypes: ['villa', 'apartment', 'co-living'],
  },
  { name: 'BBQ Area', icon: Flame, validTypes: ['villa'] },
  {
    name: 'Refrigerator',
    icon: RefrigeratorIcon,
    validTypes: ['apartment', 'villa', 'pg', 'co-living'],
  },
];

export function MoreFiltersDrawer() {
  const { filters } = useSearchData();
  const { drawerOpen, setDrawerOpen } = useSearchUI();
  const { updateFilters } = useSearchUrl(filters);

  const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>({});

  const handleOpen = (open: boolean) => {
    if (open) {
      setLocalFilters({
        billingPeriod: filters.billingPeriod,
        occupancyType: filters.occupancyType,
        amenities: filters.amenities || [],
      });
    }
    setDrawerOpen(open);
  };

  const handleLocalChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenityName: string) => {
    const current = localFilters.amenities || [];
    const next = current.includes(amenityName)
      ? current.filter((a) => a !== amenityName)
      : [...current, amenityName];
    handleLocalChange('amenities', next);
  };

  const handleApply = () => {
    updateFilters({
      billingPeriod: localFilters.billingPeriod ?? null,
      occupancyType: localFilters.occupancyType ?? null,
      amenities: localFilters.amenities ?? [],
    });
    setDrawerOpen(false);
  };

  const handleClearAll = () => {
    setLocalFilters({
      billingPeriod: null,
      occupancyType: null,
      amenities: [],
    });
    updateFilters({
      billingPeriod: null,
      occupancyType: null,
      amenities: [],
    });
    setDrawerOpen(false);
  };

  const selectedAmenities = localFilters.amenities || [];

  // Derive available amenities based on current accommodation type filter
  const currentAccType =
    filters.accommodationType && filters.accommodationType !== 'any'
      ? filters.accommodationType.toLowerCase()
      : 'all';

  const derivedAmenities =
    currentAccType === 'all'
      ? ALL_AMENITIES
      : ALL_AMENITIES.filter(
          (item) =>
            item.validTypes.includes(currentAccType) ||
            item.validTypes.includes('all')
        );

  return (
    <Dialog open={drawerOpen} onOpenChange={handleOpen}>
      {/* overlayClassName="bg-transparent" ensures the background is NOT dimmed.
          Reduced max-h and adjusted top position to stay clear of the top header. */}
      <DialogContent
        overlayClassName="bg-black/20 backdrop-blur-xs"
        className="max-sm:fixed max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:max-h-[85vh] max-sm:rounded-t-3xl max-sm:rounded-b-none sm:max-w-xl sm:max-h-[65vh] sm:top-[56%] p-0 flex flex-col gap-0 overflow-hidden sm:rounded-2xl border border-gray-200 shadow-2xl bg-white z-50"
      >
        <DialogHeader className="p-5 border-b border-gray-100 text-center relative sm:text-center">
          <DialogTitle className="text-base font-bold text-gray-900">
            More Filters
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {currentAccType !== 'all'
              ? `Showing options tailored for ${filters.accommodationType}`
              : 'Refine additional criteria without repeating primary filters'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-7 no-scrollbar">
          {/* Occupancy Type */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500">
              Occupancy Type
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Any', value: null },
                { label: 'Private Room', value: 'private' },
                { label: 'Shared Room', value: 'shared' },
              ].map((item) => {
                const isSelected =
                  (localFilters.occupancyType || null) === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      handleLocalChange(
                        'occupancyType',
                        item.value as SearchFilters['occupancyType']
                      )
                    }
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all duration-150',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Billing Period */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500">
              Billing Period
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Any', value: null },
                { label: 'Daily', value: 'day' },
                { label: 'Weekly', value: 'week' },
                { label: 'Monthly', value: 'month' },
                { label: 'Semester', value: 'semester' },
                { label: 'Yearly', value: 'year' },
              ].map((item) => {
                const isSelected =
                  (localFilters.billingPeriod || null) === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      handleLocalChange(
                        'billingPeriod',
                        item.value as SearchFilters['billingPeriod']
                      )
                    }
                    className={cn(
                      'py-2 px-3.5 rounded-full text-xs font-medium border transition-all duration-150',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Amenities derived from Accommodation Type */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500">
                Amenities & Features
              </h3>
              {currentAccType !== 'all' && (
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {filters.accommodationType} specific
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {derivedAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.name);
                const Icon = amenity.icon;
                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() => toggleAmenity(amenity.name)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all duration-150',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isSelected ? 'text-white' : 'text-gray-500'
                      )}
                    />
                    <span className="truncate flex-1">{amenity.name}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 shrink-0 text-white ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="p-3.5 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-transparent underline px-2 h-9"
          >
            Clear all
          </Button>
          <Button
            onClick={handleApply}
            className="px-5 h-9 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition-transform active:scale-95"
          >
            Show results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
