/* eslint-disable */
import { BookingOrchestrator } from '../src/features/booking/services/booking-orchestrator';
import { BookingIntent } from '../src/features/booking/types/booking.types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Load env vars (assuming dotenv or run with env vars)
import 'dotenv/config';

async function runBookingRaceBenchmark() {
  console.log('🏁 Starting Booking Race Condition Benchmark...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let propertyId = '00000000-0000-0000-0000-000000000002';

  const { data: users } = await supabase.auth.admin.listUsers();
  let guestId = users?.users?.[0]?.id;

  if (!guestId) {
    guestId = '00000000-0000-0000-0000-000000000001';
  }

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 10);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 15);

  const CONCURRENT_REQUESTS = 100; // 1000 might overwhelm local connection pools quickly, let's start with 100 to prove the lock mechanism

  console.log(
    `🚀 Simulating ${CONCURRENT_REQUESTS} concurrent booking requests for property ${propertyId}...`
  );

  let successes = 0;
  let rejections = 0;
  const errors: any[] = [];

  const promises = Array.from({ length: CONCURRENT_REQUESTS }).map(
    async (_, index) => {
      // Generate a unique idempotency key for each so they aren't rejected as idempotency duplicates
      // We want to test the lock/transaction overlap logic
      const intent: BookingIntent = {
        propertyId,
        moveInDate: checkIn.toISOString().split('T')[0],
        leaseDurationMonths: 6,
        guestsCount: 2,
        currency: 'INR',
        channel: 'web',
        idempotencyKey: uuidv4(),
      };

      try {
        await BookingOrchestrator.processIntent(guestId, intent);
        successes++;
      } catch (err: any) {
        rejections++;
        // We expect LockAcquisitionError or AvailabilityConflictError
        errors.push(err.code || err.message);
      }
    }
  );

  const startTime = Date.now();
  await Promise.allSettled(promises);
  const duration = Date.now() - startTime;

  console.log('\n📊 Benchmark Results:');
  console.log(`⏱️ Duration: ${duration}ms`);
  console.log(`✅ Successful bookings (Expected: 1): ${successes}`);
  console.log(
    `❌ Rejected bookings (Expected: ${CONCURRENT_REQUESTS - 1}): ${rejections}`
  );

  const errorTypes = errors.reduce(
    (acc, err) => {
      acc[err] = (acc[err] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('📉 Rejection Reasons:');
  console.table(errorTypes);

  if (successes === 1) {
    console.log('\n🎉 PASS: Strict transactional integrity maintained.');
  } else {
    console.error(
      `\n💥 FAIL: Concurrency violation! ${successes} bookings succeeded.`
    );
    process.exit(1);
  }
}

runBookingRaceBenchmark().catch(console.error);
