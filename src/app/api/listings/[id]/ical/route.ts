import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function formatIcsDate(dateStr: string) {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, '');
}

function formatIcsDateTime(date: Date) {
  // Convert to YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const listingId = params.id;
  const supabase = await createClient();

  try {
    // 1. Fetch listing details
    let currentListing = null;
    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, public_id')
      .eq('public_id', listingId)
      .maybeSingle();

    if (listing) {
      currentListing = listing;
    } else {
      // Try by internal UUID just in case
      const { data: listingById } = await supabase
        .from('listings')
        .select('id, title, public_id')
        .eq('id', listingId)
        .maybeSingle();

      if (listingById) {
        currentListing = listingById;
      }
    }

    if (!currentListing) {
      return new NextResponse('Listing not found', { status: 404 });
    }

    // 2. Fetch internal blocks (exclude external_calendar to prevent circular sync)
    const { data: blocks, error: blocksError } = await supabase
      .from('listing_availability')
      .select('id, start_date, end_date, source')
      .eq('listing_id', currentListing.id)
      .neq('status', 'available')
      .neq('source', 'external_calendar');

    if (blocksError) {
      throw blocksError;
    }

    // 3. Generate ICS content
    const now = formatIcsDateTime(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EliteStay//Host Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:EliteStay - ${currentListing.title.substring(0, 50)}`,
      `X-WR-TIMEZONE:UTC`,
    ];

    for (const block of blocks || []) {
      const summary =
        block.source === 'booking' ? 'EliteStay Booking' : 'EliteStay Blocked';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${block.id}@elitestay.app`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${formatIcsDate(block.start_date)}`,
        `DTEND;VALUE=DATE:${formatIcsDate(block.end_date)}`,
        `SUMMARY:${summary}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    icsContent.push('END:VCALENDAR');

    // Return with proper ICS headers
    return new NextResponse(icsContent.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="elitestay-${listingId}.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating ICS:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
