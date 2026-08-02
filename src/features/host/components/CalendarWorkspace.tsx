'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
import {
  HostTimelineViewModel,
  TimelineListing,
  TimelineEvent,
} from '../view-models/timeline.viewmodel';

interface CalendarWorkspaceProps {
  listings: TimelineListing[];
  viewModel: HostTimelineViewModel;
}

export function CalendarWorkspace({
  listings,
  viewModel,
}: CalendarWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [listingFilter, setListingFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTimeline = useMemo(() => {
    const filterEvent = (event: TimelineEvent) => {
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
    };

    return {
      today: viewModel.today.filter(filterEvent),
      tomorrow: viewModel.tomorrow.filter(filterEvent),
      thisWeek: viewModel.thisWeek.filter(filterEvent),
      upcoming: viewModel.upcoming.filter(filterEvent),
    };
  }, [viewModel, listingFilter, typeFilter, searchQuery]);

  const hasEvents =
    filteredTimeline.today.length > 0 ||
    filteredTimeline.tomorrow.length > 0 ||
    filteredTimeline.thisWeek.length > 0 ||
    filteredTimeline.upcoming.length > 0;

  const renderEventList = (events: TimelineEvent[]) => {
    return events.map((event) => {
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
                      event.isUrgent ? 'text-rose-900' : 'text-slate-900'
                    )}
                  >
                    {event.title}
                  </h4>
                  {event.subtitle && (
                    <p className="text-sm text-slate-600">{event.subtitle}</p>
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
    });
  };

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
        {!hasEvents ? (
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
          <div className="relative space-y-10">
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>

            {/* Today Section */}
            {filteredTimeline.today.length > 0 && (
              <div className="space-y-4">
                <div className="sm:ml-16">
                  <Badge
                    variant="secondary"
                    className="bg-rose-50 text-rose-700 hover:bg-rose-50 font-semibold px-3 py-1"
                  >
                    Today
                  </Badge>
                </div>
                <div className="space-y-6">
                  {renderEventList(filteredTimeline.today)}
                </div>
              </div>
            )}

            {/* Tomorrow Section */}
            {filteredTimeline.tomorrow.length > 0 && (
              <div className="space-y-4">
                <div className="sm:ml-16">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-semibold px-3 py-1"
                  >
                    Tomorrow
                  </Badge>
                </div>
                <div className="space-y-6">
                  {renderEventList(filteredTimeline.tomorrow)}
                </div>
              </div>
            )}

            {/* This Week Section */}
            {filteredTimeline.thisWeek.length > 0 && (
              <div className="space-y-4">
                <div className="sm:ml-16">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-semibold px-3 py-1"
                  >
                    This Week
                  </Badge>
                </div>
                <div className="space-y-6">
                  {renderEventList(filteredTimeline.thisWeek)}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {filteredTimeline.upcoming.length > 0 && (
              <div className="space-y-4">
                <div className="sm:ml-16">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-semibold px-3 py-1"
                  >
                    Upcoming
                  </Badge>
                </div>
                <div className="space-y-6">
                  {renderEventList(filteredTimeline.upcoming)}
                </div>
              </div>
            )}
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
