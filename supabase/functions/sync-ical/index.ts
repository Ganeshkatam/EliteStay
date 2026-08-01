// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.111.0";
import ICAL from "https://esm.sh/ical.js@1.5.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
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
        // Fetch external ICS
        const response = await fetch(feed.feed_url);
        if (!response.ok) throw new Error(`Failed to fetch feed: ${response.statusText}`);
        
        const icsData = await response.text();
        
        // Parse ICS data
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        
        const activeUids = [];

        for (const vevent of vevents) {
          const event = new ICAL.Event(vevent);
          const uid = event.uid;
          
          let startDateStr, endDateStr;
          
          if (event.startDate) {
            startDateStr = event.startDate.toJSDate().toISOString().split('T')[0];
          }
          if (event.endDate) {
            endDateStr = event.endDate.toJSDate().toISOString().split('T')[0];
          } else if (startDateStr) {
            // Default to 1 day if end date is missing
            const dt = event.startDate.toJSDate();
            dt.setDate(dt.getDate() + 1);
            endDateStr = dt.toISOString().split('T')[0];
          }

          if (!startDateStr || !endDateStr || !uid) continue;

          const summary = event.summary || 'External Event';
          
          activeUids.push(uid);

          // Upsert into external_calendar_events
          const { error: upsertError } = await supabase
            .from('external_calendar_events')
            .upsert({
              feed_id: feed.id,
              external_uid: uid,
              listing_id: feed.listing_id,
              start_date: startDateStr,
              end_date: endDateStr,
              summary: summary,
              last_seen_at: new Date().toISOString()
            }, {
              onConflict: 'feed_id,external_uid'
            });

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
        // 1. Delete all external blocks for this listing
        await supabase
          .from('listing_availability')
          .delete()
          .eq('listing_id', feed.listing_id)
          .eq('source', 'external_calendar');

        // 2. Fetch current external events across all feeds for this listing
        const { data: currentEvents } = await supabase
          .from('external_calendar_events')
          .select('*')
          .eq('listing_id', feed.listing_id);

        if (currentEvents && currentEvents.length > 0) {
          const availabilityBlocks = currentEvents.map((e: any) => ({
            listing_id: feed.listing_id,
            start_date: e.start_date,
            end_date: e.end_date,
            status: 'unavailable',
            source: 'external_calendar'
          }));

          await supabase.from('listing_availability').insert(availabilityBlocks);
        }

        await supabase
          .from('ical_feeds')
          .update({ 
            last_synced_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            last_error: null 
          })
          .eq('id', feed.id);
          
        results.push({ feedId: feed.id, status: 'success' });
      } catch (feedErr: any) {
        await supabase
          .from('ical_feeds')
          .update({ 
            last_synced_at: new Date().toISOString(),
            last_error: feedErr.message 
          })
          .eq('id', feed.id);
          
        results.push({ feedId: feed.id, status: 'error', message: feedErr.message });
      }
    }

    return new Response(JSON.stringify({ message: "Sync complete", results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('Sync failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
