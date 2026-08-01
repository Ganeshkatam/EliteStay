import { testBookingFlow } from './booking.test';
import { testStayFlow } from './stay.test';

async function runJourney() {
  console.log('Starting E2E Journey Tests...\n');
  
  try {
    const bookingId = await testBookingFlow();
    await testStayFlow(bookingId);
    
    console.log('\n🎉 All integration tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

runJourney();
