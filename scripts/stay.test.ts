import { createClient } from '@supabase/supabase-js';
import assert from 'assert';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function testStayFlow(bookingId: string) {
  console.log('--- Running Stay Tests ---');
  
  const supabaseGuest = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseHost = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: guestData, error: guestErr } = await supabaseGuest.auth.signInWithPassword({
    email: 'guest1@elitestay.com',
    password: 'password123'
  });
  assert(!guestErr && guestData.user, 'Guest login failed');

  const { data: hostData, error: hostErr } = await supabaseHost.auth.signInWithPassword({
    email: 'host1@elitestay.com',
    password: 'password123'
  });
  assert(!hostErr && hostData.user, 'Host login failed');

  const { data: booking } = await supabaseHost.from('bookings').select('*').eq('id', bookingId).single();
  assert(booking, 'Booking not found');

  const { data: stay, error: stayError } = await supabaseHost.from('stays').insert({
    created_from_booking_id: booking.id,
    listing_id: booking.listing_id,
    guest_id: booking.guest_id,
    status: 'upcoming',
    expected_move_in_date: '2026-09-01',
    expected_move_out_date: '2026-12-01',
    agreed_amount: booking.snapshot_monthly_rent,
    agreed_billing_period: booking.snapshot_billing_period,
    security_deposit_paid: booking.snapshot_security_deposit
  }).select().single();
  if (stayError) console.error('Stay Error:', stayError);
  assert(!stayError && stay, 'Stay creation failed');

  const { error: activeError } = await supabaseGuest.rpc('transition_stay', {
    p_stay_id: stay.id,
    p_current_status: 'upcoming',
    p_new_status: 'active',
    p_actor_id: guestData.user.id,
    p_updates: { actual_move_in_date: '2026-09-01' }
  });
  if (activeError) console.error('Active Error:', activeError);
  assert(!activeError, 'Guest activate stay failed');

  const { error: completeError } = await supabaseHost.rpc('transition_stay', {
    p_stay_id: stay.id,
    p_current_status: 'active',
    p_new_status: 'completed',
    p_actor_id: hostData.user.id,
    p_updates: { actual_move_out_date: '2026-10-01' }
  });
  if (completeError) console.error('Complete Error:', completeError);
  assert(!completeError, 'Host complete stay failed');

  const { data: review, error: reviewError } = await supabaseGuest.from('reviews').insert({
    stay_id: stay.id,
    listing_id: stay.listing_id,
    guest_id: stay.guest_id,
    rating: 5,
    comment: 'Great stay!'
  }).select().single();
  if (reviewError) console.error('Review Error:', reviewError);
  assert(!reviewError && review, 'Review creation failed. Error: ' + reviewError?.message);

  console.log('✅ Stay tests passed');
}
