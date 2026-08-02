import {
  TimelineListing,
  TimelineStay,
  TimelineBooking,
  TimelineAvailability,
  TimelineEvent,
  HostTimelineViewModel,
} from '../view-models/timeline.viewmodel';
import {
  format,
  isToday,
  isTomorrow,
  isBefore,
  startOfToday,
  addDays,
} from 'date-fns';

export class TimelineService {
  static getTimelineEvents(
    listings: TimelineListing[],
    stays: TimelineStay[],
    bookings: TimelineBooking[],
    availability: TimelineAvailability[]
  ): HostTimelineViewModel {
    const events: TimelineEvent[] = [];
    const today = startOfToday();
    const endOfWeek = addDays(today, 7);

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
          priority: 'normal',
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
          priority: 'normal',
        });

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
          priority: 'informational',
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
        date: today,
        type: 'pending_booking',
        listingId: listing.id,
        listingTitle: listing.title || 'Untitled',
        title: `Pending Booking: ${guestName}`,
        subtitle: `Requested move-in: ${format(reqDate, 'MMM d, yyyy')} (${booking.requested_duration} months)`,
        isUrgent: true,
        actionHref: `/host/bookings/${booking.id}`,
        actionText: 'Review',
        priority: 'urgent',
      });
    });

    // 3. Blocks / Maintenance
    availability.forEach((block) => {
      if (block.status === 'available') return;
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
          priority: 'normal',
        });
      }
    });

    // Sort: chronologically, then by priority weight (urgent > normal > informational)
    const priorityWeight = { urgent: 3, normal: 2, informational: 1 };
    const sortedEvents = events.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    // Group events
    const todayEvents: TimelineEvent[] = [];
    const tomorrowEvents: TimelineEvent[] = [];
    const thisWeekEvents: TimelineEvent[] = [];
    const upcomingEvents: TimelineEvent[] = [];

    sortedEvents.forEach((event) => {
      if (isToday(event.date)) {
        todayEvents.push(event);
      } else if (isTomorrow(event.date)) {
        tomorrowEvents.push(event);
      } else if (isBefore(event.date, endOfWeek)) {
        thisWeekEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    return {
      today: todayEvents,
      tomorrow: tomorrowEvents,
      thisWeek: thisWeekEvents,
      upcoming: upcomingEvents,
    };
  }
}
