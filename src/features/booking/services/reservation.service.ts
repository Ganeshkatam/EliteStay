import { BookingRepository } from '../repositories/booking.repository';
import { StayReservation, BookingIntent } from '../types/booking.types';
import { CalculatedPricing } from './pricing.service';
import { observeService } from '@/lib/observability/decorators/observe-service';

export class ReservationService {
  /**
   * Initializes the reservation in DRAFT state using the repository's atomic RPC.
   * This is the entry point for the DB reservation lifecycle.
   */
  static async createDraft(
    guestId: string,
    intent: BookingIntent,
    pricing: CalculatedPricing
  ): Promise<StayReservation> {
    return observeService('ReservationService', 'createDraft', async () => {
      const reservation = await BookingRepository.createReservationSafe(
        guestId,
        intent,
        pricing.snapshot,
        pricing.monthlyRent,
        pricing.securityDeposit,
        pricing.maintenanceFee,
        pricing.utilities,
        pricing.brokerageFee,
        pricing.totalInitialPayment
      );

      return reservation;
    });
  }

  static async markValidated(
    reservation: StayReservation
  ): Promise<StayReservation> {
    return observeService('ReservationService', 'markValidated', async () => {
      return BookingRepository.transitionState(
        reservation,
        'DRAFT',
        'VALIDATED'
      );
    });
  }

  static async markValidationFailed(
    reservation: StayReservation
  ): Promise<StayReservation> {
    return observeService(
      'ReservationService',
      'markValidationFailed',
      async () => {
        return BookingRepository.transitionState(
          reservation,
          'DRAFT',
          'VALIDATION_FAILED'
        );
      }
    );
  }

  static async markLocked(
    reservation: StayReservation
  ): Promise<StayReservation> {
    return observeService('ReservationService', 'markLocked', async () => {
      return BookingRepository.transitionState(
        reservation,
        'VALIDATED',
        'LOCKED'
      );
    });
  }
}
