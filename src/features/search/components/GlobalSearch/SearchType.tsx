'use client';

import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchTypeProps {
  variant: SearchVariant;
}

export function SearchType({ variant }: SearchTypeProps) {
  const { state, updateState } = useSearchContext();
  const isCompact = variant === 'compact';

  return (
    <SearchSection variant={variant} label="Type" showDivider={false}>
      <Select
        value={state.type || "any"}
        onValueChange={(value) => updateState({ type: value === "any" ? "" : value })}
        disabled={isCompact}
      >
        <SelectTrigger
          className={cn(
            "w-full bg-transparent p-0 h-auto border-none outline-none focus:ring-0 shadow-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-all duration-250 cursor-pointer text-left [&>span]:line-clamp-1",
            isCompact ? "text-gray-900" : "text-gray-900"
          )}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        >
          <SelectValue placeholder="Any type" />
        </SelectTrigger>
        <SelectContent className="z-[100] rounded-2xl shadow-xl border-gray-100 p-2">
          <SelectItem value="any" className="rounded-lg cursor-pointer">Any type</SelectItem>
          <SelectItem value="apartment" className="rounded-lg cursor-pointer">Apartment</SelectItem>
          <SelectItem value="pg" className="rounded-lg cursor-pointer">PG</SelectItem>
          <SelectItem value="hostel" className="rounded-lg cursor-pointer">Hostel</SelectItem>
          <SelectItem value="villa" className="rounded-lg cursor-pointer">Villa</SelectItem>
          <SelectItem value="co-living" className="rounded-lg cursor-pointer">Co-Living</SelectItem>
          <SelectItem value="private-room" className="rounded-lg cursor-pointer">Private Room</SelectItem>
        </SelectContent>
      </Select>
    </SearchSection>
  );
}
