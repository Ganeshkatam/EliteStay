// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  BookingIntent,
  StayReservation,
  RentalApplication,
  ListingBookingPolicy,
} from '../types/booking.types';
import { BookingIntentService } from './booking-intent.service';
import { AvailabilityService } from './availability.service';
import { LockService } from './lock.service';
import { PricingService } from './pricing.service';
import { ReservationService } from './reservation.service';
import { PaymentService } from './payment.service';
import { observeService } from '@/lib/observability/decorators/observe-service';
import { BookingRepository } from '../repositories/booking.repository';
import { RentalApplicationRepository } from '../repositories/rental-application.repository';

export class BookingOrchestrator {
  /**
   * Executes the full transactional booking flow safely.
   */
  static async processIntent(
    guestId: string,
    intent: BookingIntent
  ): Promise<StayReservation | RentalApplication> {
    return observeService('BookingOrchestrator', 'processIntent', async () => {
      // 1. Validate Intent (Draft stage logic)
      BookingIntentService.validate(intent);

      // Idempotency check: did we already process this?
      const existing = await BookingRepository.getByIdempotencyKey(
        intent.idempotencyKey
      );
      if (existing) {
        return existing;
      }

      // 2. Fetch policy to branch flow
      const policy = await BookingRepository.getListingBookingPolicy(
        intent.propertyId
      );

      if (policy === 'RENTAL_APPLICATION') {
        return await BookingOrchestrator.processRentalApplication(
          guestId,
          intent
        );
      } else if (policy === 'INSTANT_RESERVATION') {
        return await BookingOrchestrator.processInstantReservation(
          guestId,
          intent
        );
      } else {
        throw new Error(
          `Unsupported booking policy: ${policy}. Currently only INSTANT_RESERVATION and RENTAL_APPLICATION are supported in checkout.`
        );
      }
    });
  }

  private static async processInstantReservation(
    guestId: string,
    intent: BookingIntent
  ): Promise<StayReservation> {
    // 3. Pre-Check Availability
    const isAvailable = await AvailabilityService.validateAvailability(
      intent.propertyId,
      intent.moveInDate,
      intent.leaseDurationMonths
    );
    if (!isAvailable) {
      throw new Error('Property is not available for these dates.');
    }

    // 4. Acquire Distributed Lock
    let lockToken: string | null = null;
    try {
      // Lock based on moveInDate for the check (we'd use end date if we mapped perfectly, but using moveInDate for standard locking compat)
      lockToken = await LockService.acquireBookingLock(
        intent.propertyId,
        intent.moveInDate,
        intent.moveInDate
      );

      // 5. Snapshot Pricing
      const pricing = await PricingService.calculateAndSnapshot(intent);

      // 6. Create Reservation (Atomic Transaction: checks availability again and inserts DRAFT)
      const draftReservation = await ReservationService.createDraft(
        guestId,
        intent,
        pricing
      );

      // 7. State Machine: Validated & Locked
      const validated =
        await ReservationService.markValidated(draftReservation);
      const locked = await ReservationService.markLocked(validated);

      // 8. Authorize Payment
      const authorized = await PaymentService.authorizePayment(locked);

      // 9. Capture & Confirm
      const confirmed = await PaymentService.captureAndConfirm(authorized);

      return confirmed;
    } catch (error) {
      console.error('[BookingOrchestrator] Instant flow failed:', error);
      throw error;
    } finally {
      // 10. Always Release Lock
      if (lockToken) {
        await LockService.releaseBookingLock(
          intent.propertyId,
          intent.moveInDate,
          intent.moveInDate,
          lockToken
        );
      }
    }
  }

  private static async processRentalApplication(
    guestId: string,
    intent: BookingIntent
  ): Promise<RentalApplication> {
    // 3. Create the Rental Application (DRAFT)
    const application = await RentalApplicationRepository.createApplication(
      guestId,
      intent
    );

    // Additional steps like submitting it, notifying the host, or locking the property pending review
    // can be orchestrated here. For now, we return the created application.
    return application;
  }
}
