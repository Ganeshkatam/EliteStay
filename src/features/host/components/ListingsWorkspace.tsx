'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Calendar,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface WorkspaceListing {
  id: string;
  public_id: string | null;
  title: string | null;
  status: string;
  city: string | null;
  locality: string | null;
  images: { storage_path: string }[] | null;
  prices: { amount: number; billing_period: string }[] | null;
  listing_build_progress:
    { percent_complete: number; last_step: string }[] | null;
}

interface ListingWorkspaceProps {
  listings: WorkspaceListing[];
}

export function ListingsWorkspace({ listings }: ListingWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredListings = listings.filter((listing) => {
    if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
    if (
      searchQuery &&
      !listing.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Workspace Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <Button
            variant="outline"
            className="bg-white border-slate-200 text-slate-600 gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto mask-fade-right">
          <FilterPill
            label="All"
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <FilterPill
            label="Published"
            active={statusFilter === 'published'}
            onClick={() => setStatusFilter('published')}
          />
          <FilterPill
            label="Drafts"
            active={statusFilter === 'draft'}
            onClick={() => setStatusFilter('draft')}
          />
          <FilterPill
            label="Needs Attention"
            active={statusFilter === 'needs_attention'}
            onClick={() => setStatusFilter('needs_attention')}
          />
        </div>
      </div>

      {/* Listing List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-12 sm:col-span-5">Listing</div>
          <div className="hidden sm:block sm:col-span-2">Health</div>
          <div className="hidden sm:block sm:col-span-2">Price</div>
          <div className="hidden sm:block sm:col-span-2">Availability</div>
          <div className="hidden sm:block sm:col-span-1 text-right">
            Actions
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No listings match your criteria.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function ListingRow({ listing }: { listing: WorkspaceListing }) {
  const imageUrl = listing.images?.[0]?.storage_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${listing.images[0].storage_path}`
    : null;

  const title = listing.title || 'Untitled Listing';
  const location =
    [listing.locality, listing.city].filter(Boolean).join(', ') ||
    'No location set';

  const price = listing.prices?.[0];
  const priceDisplay = price
    ? `₹${price.amount.toLocaleString('en-IN')} / ${price.billing_period}`
    : 'No pricing';

  const progress = listing.listing_build_progress?.[0];
  const percentComplete = progress?.percent_complete || 0;

  const isPublished = listing.status === 'published';
  const needsAttention = !isPublished && percentComplete < 100;

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
      {/* Listing Info */}
      <div className="col-span-10 sm:col-span-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-200">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Image
                className="w-5 h-5 opacity-50"
                src="/placeholder.svg"
                alt="placeholder"
                width={20}
                height={20}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col truncate">
          <span className="font-semibold text-slate-900 truncate">{title}</span>
          <span className="text-xs text-slate-500 truncate">{location}</span>
        </div>
      </div>

      {/* Health / Status */}
      <div className="hidden sm:flex sm:col-span-2 flex-col gap-1 justify-center">
        {isPublished ? (
          <div className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Published
          </div>
        ) : needsAttention ? (
          <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
            <AlertCircle className="w-4 h-4" />
            Needs Attention
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
            <Clock className="w-4 h-4" />
            Draft
          </div>
        )}

        {!isPublished && (
          <span className="text-xs text-slate-500 font-medium">
            {percentComplete}% Complete
          </span>
        )}
      </div>

      {/* Price */}
      <div className="hidden sm:flex sm:col-span-2 items-center text-sm font-medium text-slate-900">
        {priceDisplay}
      </div>

      {/* Availability */}
      <div className="hidden sm:flex sm:col-span-2 items-center">
        {isPublished ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            Available
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-400 border-slate-200">
            Offline
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 group-hover:text-slate-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isPublished ? (
              <DropdownMenuItem asChild>
                <Link
                  href={`/host/listings/${listing.id}/build/${progress?.last_step || 'accommodation'}`}
                  className="cursor-pointer flex items-center"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Resume Build
                </Link>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/host/listings/${listing.id}/edit`}
                    className="cursor-pointer flex items-center"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Listing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/host/calendar?listing=${listing.id}`}
                    className="cursor-pointer flex items-center"
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Manage Calendar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/rooms/${listing.public_id}`}
                    target="_blank"
                    className="cursor-pointer flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" /> View as Guest
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
