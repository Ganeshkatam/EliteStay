import { createClient } from '@supabase/supabase-js';
import assert from 'assert';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function testBookingFlow() {
  console.log('--- Running Booking Tests ---');
  
  const supabaseGuest = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseHost = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: guestData, error: guestErr } = await supabaseGuest.auth.signInWithPassword({
    email: 'guest1@elitestay.com',
    password: 'password123'
  });
  if (guestErr) console.error('Guest Error:', guestErr);
  assert(!guestErr && guestData.user, 'Guest login failed');

  const { data: hostData, error: hostErr } = await supabaseHost.auth.signInWithPassword({
    email: 'host1@elitestay.com',
    password: 'password123'
  });
  if (hostErr) console.error('Host Error:', hostErr);
  assert(!hostErr && hostData.user, 'Host login failed');

  // Find a listing owned by host1
  const { data: listingData, error: listingErr } = await supabaseHost
    .from('listings')
    .select('id, listing_prices(amount, security_deposit, billing_period)')
    .eq('host_id', hostData.user.id)
    .limit(1)
    .single();
  if (listingErr) console.error('Listing Error:', listingErr);
  assert(listingData, 'No listing found for host1');

  const listing = {
    id: listingData.id,
    amount: (listingData.listing_prices as any)[0]?.amount || 10000,
    security_deposit: (listingData.listing_prices as any)[0]?.security_deposit || 5000,
    billing_period: (listingData.listing_prices as any)[0]?.billing_period || 'month',
  };

  // 1. Guest creates a booking request
  const { data: newBooking, error: reqError } = await supabaseGuest.from('bookings').insert({
    listing_id: listing.id,
    guest_id: guestData.user.id,
    requested_move_in: '2026-09-01',
    requested_duration: 3,
    status: 'pending',
    snapshot_monthly_rent: listing.amount,
    snapshot_security_deposit: listing.security_deposit,
    snapshot_maintenance_fee: 0,
    snapshot_billing_period: listing.billing_period,
    snapshot_minimum_stay: 1
  }).select().single();
  if (reqError) console.error('Request Error:', reqError);
  assert(!reqError && newBooking, 'Booking request failed');

  // Also log the event
  await supabaseGuest.from('booking_events').insert({
    booking_id: newBooking.id,
    action: 'request_created',
    actor_id: guestData.user.id,
    new_status: 'pending'
  });

  // 2. Validate Invariant
  const { data: approvedData, error: approveError } = await supabaseHost.rpc('transition_booking', {
    p_booking_id: newBooking.id,
    p_current_status: 'pending',
    p_new_status: 'approved',
    p_actor_id: hostData.user.id
  });
  if (approveError) console.error('Approve Error:', approveError);
  assert(!approveError && approvedData.success, 'Host approve failed: ' + (approveError?.message || ''));

  console.log('✅ Booking tests passed');
  return newBooking.id;
}
