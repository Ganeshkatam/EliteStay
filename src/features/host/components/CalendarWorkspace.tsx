'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isBefore, startOfToday, addDays } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Search,
  ArrowRight,
  ArrowLeft,
  Wrench,
  AlertCircle,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TimelineListing {
  id: string;
  title: string | null;
}

export interface TimelineStay {
  id: string;
  listing_id: string;
  expected_move_in_date: string;
  expected_move_out_date: string;
  status: string;
  guest_profiles?: { full_name: string | null } | null;
}

export interface TimelineBooking {
  id: string;
  listing_id: string;
  requested_move_in: string;
  requested_duration: number;
  status: string;
  guest_profiles?: { full_name: string | null } | null;
}

export interface TimelineAvailability {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  status: string;
  source: string;
}

interface CalendarWorkspaceProps {
  listings: TimelineListing[];
  stays: TimelineStay[];
  bookings: TimelineBooking[];
  availability: TimelineAvailability[];
}

type EventType =
  | 'move_in'
  | 'move_out'
  | 'maintenance'
  | 'pending_booking'
  | 'availability_opens';

interface TimelineEvent {
  id: string;
  date: Date;
  type: EventType;
  listingId: string;
  listingTitle: string;
  title: string;
  subtitle?: string;
  status?: string;
  actionHref?: string;
  actionText?: string;
  isUrgent?: boolean;
}

export function CalendarWorkspace({
  listings,
  stays,
  bookings,
  availability,
}: CalendarWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [listingFilter, setListingFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Build the Operations Timeline Feed
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const today = startOfToday();

    // 1. Stays -> Move Ins & Move Outs
    stays.forEach((stay) => {
      const listing = listings.find((l) => l.id === stay.listing_id);
      if (!listing) return;
      const guestName = stay.guest_profiles?.full_name || 'Guest';

      const moveInDate = new Date(stay.expected_move_in_date);
      if (!isBefore(moveInDate, today)) {
        events.push({
          id: `move_in_${stay.id}`,
          date: moveInDate,
          type: 'move_in',
          listingId: listing.id,
          listingTitle: listing.title || 'Untitled',
          title: `Move-in: ${guestName}`,
          subtitle: 'Ensure property is cleaned and ready.',
          status: stay.status,
          actionHref: `/host/stays/${stay.id}`,
          actionText: 'View Stay',
        });
      }

      const moveOutDate = new Date(stay.expected_move_out_date);
      if (!isBefore(moveOutDate, today)) {
        events.push({
          id: `move_out_${stay.id}`,
          date: moveOutDate,
          type: 'move_out',
          listingId: listing.id,
          listingTitle: listing.title || 'Untitled',
          title: `Move-out: ${guestName}`,
          subtitle: 'Schedule inspection and cleaning.',
          status: stay.status,
          actionHref: `/host/stays/${stay.id}`,
          actionText: 'View Stay',
        });

        // When a stay ends, availability opens (unless there's a block or another stay starting that day)
        // For V1, we'll optimistically add an 'Availability Opens' event the day after move out.
        const availOpens = addDays(moveOutDate, 1);
        events.push({
          id: `avail_${stay.id}`,
          date: availOpens,
          type: 'availability_opens',
          listingId: listing.id,
          listingTitle: listing.title || 'Untitled',
          title: 'Availability Opens',
          subtitle: 'Ready for new bookings.',
          actionHref: `/host/calendar?listing=${listing.id}`,
          actionText: 'Manage',
        });
      }
    });

    // 2. Pending Bookings
    bookings.forEach((booking) => {
      const listing = listings.find((l) => l.id === booking.listing_id);
      if (!listing) return;
      const guestName = booking.guest_profiles?.full_name || 'Guest';

      const reqDate = new Date(booking.requested_move_in);

      events.push({
        id: `pending_${booking.id}`,
        // Pending bookings are actionable *today*, so we force them to today's date in the timeline
        // to ensure they are at the top, but display the requested date in the UI.
        date: today,
        type: 'pending_booking',
        listingId: listing.id,
        listingTitle: listing.title || 'Untitled',
        title: `Pending Booking: ${guestName}`,
        subtitle: `Requested move-in: ${format(reqDate, 'MMM d, yyyy')} (${booking.requested_duration} months)`,
        isUrgent: true,
        actionHref: `/host/bookings/${booking.id}`,
        actionText: 'Review',
      });
    });

    // 3. Blocks / Maintenance
    availability.forEach((block) => {
      if (block.status === 'available') return; // We only care about blocks here
      const listing = listings.find((l) => l.id === block.listing_id);
      if (!listing) return;

      const startDate = new Date(block.start_date);
      if (!isBefore(startDate, today)) {
        events.push({
          id: `block_${block.id}`,
          date: startDate,
          type: 'maintenance',
          listingId: listing.id,
          listingTitle: listing.title || 'Untitled',
          title:
            block.source === 'maintenance'
              ? 'Maintenance Block Starts'
              : 'Manual Block Starts',
          subtitle: `Until ${format(new Date(block.end_date), 'MMM d, yyyy')}`,
          actionHref: `/host/calendar?listing=${listing.id}`,
          actionText: 'Manage',
        });
      }
    });

    // Sort chronologically
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [listings, stays, bookings, availability]);

  // Apply filters
  const filteredEvents = timelineEvents.filter((event) => {
    if (listingFilter !== 'all' && event.listingId !== listingFilter)
      return false;
    if (typeFilter !== 'all' && event.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !event.title.toLowerCase().includes(q) &&
        !event.listingTitle.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-1 items-center gap-2 w-full sm:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events, guests, or listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>

          <Select value={listingFilter} onValueChange={setListingFilter}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-700">
              <SelectValue placeholder="All Listings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listings</SelectItem>
              {listings.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.title || 'Untitled'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto mask-fade-right">
          <FilterPill
            label="All Events"
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          />
          <FilterPill
            label="Action Needed"
            active={typeFilter === 'pending_booking'}
            onClick={() => setTypeFilter('pending_booking')}
          />
          <FilterPill
            label="Move-ins"
            active={typeFilter === 'move_in'}
            onClick={() => setTypeFilter('move_in')}
          />
          <FilterPill
            label="Move-outs"
            active={typeFilter === 'move_out'}
            onClick={() => setTypeFilter('move_out')}
          />
        </div>
      </div>

      {/* Operations Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No upcoming events
            </h3>
            <p className="text-sm">
              Your calendar is clear. New move-ins, blocks, and requests will
              appear here.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>

            <div className="space-y-8">
              {filteredEvents.map((event, index) => {
                const showDateHeader =
                  index === 0 ||
                  format(event.date, 'yyyy-MM-dd') !==
                    format(filteredEvents[index - 1].date, 'yyyy-MM-dd');

                let Icon = CalendarIcon;
                let iconColor = 'text-slate-400';
                let bgColor = 'bg-slate-100';

                if (event.type === 'move_in') {
                  Icon = ArrowRight;
                  iconColor = 'text-blue-600';
                  bgColor = 'bg-blue-100';
                } else if (event.type === 'move_out') {
                  Icon = ArrowLeft;
                  iconColor = 'text-orange-600';
                  bgColor = 'bg-orange-100';
                } else if (event.type === 'pending_booking') {
                  Icon = AlertCircle;
                  iconColor = 'text-rose-600';
                  bgColor = 'bg-rose-100';
                } else if (event.type === 'maintenance') {
                  Icon = Wrench;
                  iconColor = 'text-slate-600';
                  bgColor = 'bg-slate-200';
                } else if (event.type === 'availability_opens') {
                  Icon = CheckCircle2;
                  iconColor = 'text-emerald-600';
                  bgColor = 'bg-emerald-100';
                }

                return (
                  <div key={event.id} className="relative z-10">
                    {showDateHeader && (
                      <div className="mb-4 sm:ml-16">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-semibold px-3 py-1"
                        >
                          {isToday(event.date)
                            ? 'Today'
                            : format(event.date, 'EEEE, MMM d, yyyy')}
                        </Badge>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-start group">
                      {/* Icon */}
                      <div
                        className={`hidden sm:flex h-14 w-14 rounded-full border-4 border-white ${bgColor} items-center justify-center flex-shrink-0 z-10`}
                      >
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                      </div>

                      {/* Content Card */}
                      <div
                        className={cn(
                          'flex-1 rounded-xl border p-4 sm:p-5 transition-shadow hover:shadow-md bg-white',
                          event.isUrgent
                            ? 'border-rose-200 shadow-sm'
                            : 'border-slate-200'
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                              <Home className="h-3 w-3" />
                              {event.listingTitle}
                            </div>
                            <h4
                              className={cn(
                                'text-base font-semibold',
                                event.isUrgent
                                  ? 'text-rose-900'
                                  : 'text-slate-900'
                              )}
                            >
                              {event.title}
                            </h4>
                            {event.subtitle && (
                              <p className="text-sm text-slate-600">
                                {event.subtitle}
                              </p>
                            )}
                          </div>

                          {event.actionHref && (
                            <Link href={event.actionHref}>
                              <Button
                                variant={event.isUrgent ? 'default' : 'outline'}
                                className={cn(
                                  'w-full sm:w-auto',
                                  event.isUrgent
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-white'
                                )}
                              >
                                {event.actionText}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
