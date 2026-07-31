'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Listing {
  id: string;
  title: string;
}

interface Stay {
  id: string;
  listing_id: string;
  expected_move_in_date: string;
  expected_move_out_date: string;
  status: string;
}

interface Booking {
  id: string;
  listing_id: string;
  requested_move_in: string;
  requested_duration: number;
  status: string;
}

export function CalendarView({
  listings,
  stays,
  bookings,
}: {
  listings: Listing[];
  stays: Stay[];
  bookings: Booking[];
}) {
  const [selectedListing, setSelectedListing] = useState<string>(listings[0]?.id || '');

  const getModifiers = () => {
    if (!selectedListing) return { active: [], upcoming: [], blocked: [], pending: [] };
    
    const listingStays = stays.filter(s => s.listing_id === selectedListing);
    const listingBookings = bookings.filter(b => b.listing_id === selectedListing && b.status === 'pending');
    
    const active: Date[] = [];
    const upcoming: Date[] = [];
    const blocked: Date[] = [];
    const pending: Date[] = [];

    // Helper to add dates
    const addDateRange = (startStr: string, endStr: string, arr: Date[]) => {
      const current = new Date(startStr);
      const end = new Date(endStr);
      while (current <= end) {
        arr.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    };

    // Stays have highest precedence
    listingStays.forEach(stay => {
      if (stay.status === 'active') {
        addDateRange(stay.expected_move_in_date, stay.expected_move_out_date, active);
      } else if (stay.status === 'upcoming') {
        addDateRange(stay.expected_move_in_date, stay.expected_move_out_date, upcoming);
      }
    });

    // Pending requests
    listingBookings.forEach(booking => {
      // Basic end date calculation for pending (not exact, assuming 1 period = 1 month for visual blocking)
      const end = new Date(booking.requested_move_in);
      end.setMonth(end.getMonth() + booking.requested_duration);
      addDateRange(booking.requested_move_in, end.toISOString().split('T')[0], pending);
    });

    return { active, upcoming, blocked, pending };
  };

  const modifiers = getModifiers();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 space-y-4">
        <label className="text-sm font-medium text-gray-700">Select Listing</label>
        <Select value={selectedListing} onValueChange={setSelectedListing}>
          <SelectTrigger>
            <SelectValue placeholder="Select a listing" />
          </SelectTrigger>
          <SelectContent>
            {listings.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Legend</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-rose-600"></div>
              <span>Active Stay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Upcoming Stay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>Host Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span>Pending Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></div>
              <span>Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex justify-center bg-white border border-gray-200 rounded-xl p-8">
        {selectedListing ? (
          <Calendar
            mode="multiple"
            selected={[...modifiers.active, ...modifiers.upcoming, ...modifiers.blocked]}
            className="rounded-md scale-125 transform origin-top"
            modifiers={{
              active: modifiers.active,
              upcoming: modifiers.upcoming,
              blocked: modifiers.blocked,
              pending: modifiers.pending
            }}
            modifiersStyles={{
              active: { backgroundColor: '#e11d48', color: 'white' },
              upcoming: { backgroundColor: '#3b82f6', color: 'white' },
              blocked: { backgroundColor: '#6b7280', color: 'white' },
              pending: { backgroundColor: '#facc15', color: 'black' }
            }}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500 h-64">
            No listing selected
          </div>
        )}
      </div>
    </div>
  );
}
