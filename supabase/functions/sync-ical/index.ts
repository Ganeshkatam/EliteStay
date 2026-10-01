import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';
import ICAL from 'https://esm.sh/ical.js@1.5.0';

// Interface declarations for Deno runtime and calendar sync
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface ExternalCalendarEventRow {
  feed_id: string;
  external_uid: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  summary: string;
  last_seen_at: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 5000; // 5 seconds
const MAX_EVENTS_PER_FEED = 500;

function validateFeedUrl(urlString: string): URL {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    throw new Error('Invalid feed URL format');
  }

  // 1. Strict HTTPS enforcement
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS calendar feeds are permitted');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 2. Reject localhost and local names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'metadata.goog'
  ) {
    throw new Error('Access to internal or private hosts is prohibited');
  }

  // 3. Reject IPv4 loopback, private, carrier-grade NAT, link-local, and cloud metadata
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);
  if (ipMatch) {
    const octets = ipMatch.slice(1).map(Number);
    if (octets.some((o) => o > 255)) {
      throw new Error('Invalid IP address');
    }

    const [a, b] = octets;
    if (
      a === 127 || // 127.0.0.0/8 Loopback
      a === 10 || // 10.0.0.0/8 Private
      a === 0 || // 0.0.0.0/8 Current network
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 Private
      (a === 192 && b === 168) || // 192.168.0.0/16 Private
      (a === 169 && b === 254) || // 169.254.0.0/16 Link-Local / Cloud Metadata
      (a === 100 && b >= 64 && b <= 127) // 100.64.0.0/10 Carrier-grade NAT
    ) {
      throw new Error(
        'Access to private or link-local IP addresses is prohibited'
      );
    }
  }

  // 4. Reject IPv6 loopback, link-local, and unique local addresses
  if (
    hostname.startsWith('[') ||
    hostname.includes(':') ||
    hostname === '::1' ||
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc00:') ||
    hostname.startsWith('fd00:')
  ) {
    throw new Error('Direct IPv6 and local IPv6 feed addresses are prohibited');
  }

  return parsedUrl;
}

async function fetchWithSsrfGuard(url: URL): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'EliteStay-CalendarSync/1.0',
        Accept: 'text/calendar, text/plain, application/octet-stream',
      },
      redirect: 'error', // Prevent SSRF via open redirects
    });

    if (!response.ok) {
      throw new Error(
        `Feed server returned status ${response.status} ${response.statusText}`
      );
    }

    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (contentLength > MAX_RESPONSE_SIZE) {
        throw new Error(
          `Feed size ${contentLength} bytes exceeds limit of ${MAX_RESPONSE_SIZE} bytes`
        );
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return await response.text();
    }

    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > MAX_RESPONSE_SIZE) {
          throw new Error(
            `Feed response exceeded size limit of ${MAX_RESPONSE_SIZE} bytes`
          );
        }
        chunks.push(value);
      }
    }

    const totalBuffer = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      totalBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder('utf-8').decode(totalBuffer);
  } finally {
    clearTimeout(timeoutId);
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch enabled import feeds
    const { data: feeds, error: feedsError } = await supabase
      .from('ical_feeds')
      .select('*')
      .eq('enabled', true)
      .in('sync_direction', ['import', 'both']);

    if (feedsError) throw feedsError;

    const results = [];
    for (const feed of feeds || []) {
      try {
        // Validate URL against SSRF rules
        const validatedUrl = validateFeedUrl(feed.feed_url);

        // Fetch external ICS with size & timeout guards
        const icsData = await fetchWithSsrfGuard(validatedUrl);

        // Parse ICS data
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const activeUids: string[] = [];
        let eventCount = 0;

        for (const vevent of vevents) {
          if (eventCount >= MAX_EVENTS_PER_FEED) break;
          eventCount++;

          const event = new ICAL.Event(vevent);
          const uid = event.uid;

          let startDateStr: string | undefined;
          let endDateStr: string | undefined;

          if (event.startDate) {
            startDateStr = event.startDate
              .toJSDate()
              .toISOString()
              .split('T')[0];
          }
          if (event.endDate) {
            endDateStr = event.endDate.toJSDate().toISOString().split('T')[0];
          } else if (startDateStr) {
            const dt = event.startDate.toJSDate();
            dt.setDate(dt.getDate() + 1);
            endDateStr = dt.toISOString().split('T')[0];
          }

          if (!startDateStr || !endDateStr || !uid) continue;

          const summary = (event.summary || 'External Event').substring(0, 200);

          activeUids.push(uid);

          // Upsert into external_calendar_events
          const { error: upsertError } = await supabase
            .from('external_calendar_events')
            .upsert(
              {
                feed_id: feed.id,
                external_uid: uid,
                listing_id: feed.listing_id,
                start_date: startDateStr,
                end_date: endDateStr,
                summary: summary,
                last_seen_at: new Date().toISOString(),
              },
              {
                onConflict: 'feed_id,external_uid',
              }
            );

          if (upsertError) throw upsertError;
        }

        // Cleanup events that disappeared from feed
        if (activeUids.length > 0) {
          await supabase
            .from('external_calendar_events')
            .delete()
            .eq('feed_id', feed.id)
            .not('external_uid', 'in', `(${activeUids.join(',')})`);
        } else {
          await supabase
            .from('external_calendar_events')
            .delete()
            .eq('feed_id', feed.id);
        }

        // Reconcile availability for this listing
        await supabase
          .from('listing_availability')
          .delete()
          .eq('listing_id', feed.listing_id)
          .eq('source', 'external_calendar');

        const { data: currentEvents } = await supabase
          .from('external_calendar_events')
          .select('*')
          .eq('listing_id', feed.listing_id);

        if (currentEvents && currentEvents.length > 0) {
          const availabilityBlocks = currentEvents.map(
            (e: ExternalCalendarEventRow) => ({
              listing_id: feed.listing_id,
              start_date: e.start_date,
              end_date: e.end_date,
              status: 'unavailable',
              source: 'external_calendar',
            })
          );

          await supabase
            .from('listing_availability')
            .insert(availabilityBlocks);
        }

        await supabase
          .from('ical_feeds')
          .update({
            last_synced_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            last_error: null,
          })
          .eq('id', feed.id);

        results.push({ feedId: feed.id, status: 'success' });
      } catch (feedErr: unknown) {
        const errorMessage =
          feedErr instanceof Error ? feedErr.message : String(feedErr);
        await supabase
          .from('ical_feeds')
          .update({
            last_synced_at: new Date().toISOString(),
            last_error: errorMessage,
          })
          .eq('id', feed.id);

        results.push({
          feedId: feed.id,
          status: 'error',
          message: errorMessage,
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Sync complete', results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Sync failed:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
