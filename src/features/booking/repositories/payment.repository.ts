import { BookingRepository } from './booking.repository';
import { StayReservation, ReservationStatus } from '../types/booking.types';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';

export class PaymentRepository {
  /**
   * Associates a payment intent with a reservation.
   */
  static async setPaymentIntent(
    reservation: StayReservation,
    paymentIntentId: string,
    expectedState: ReservationStatus,
    newState: ReservationStatus
  ): Promise<StayReservation> {
    return observeRepository(
      'PaymentRepository',
      'setPaymentIntent',
      'reservations',
      async () => {
        return BookingRepository.transitionState(
          reservation,
          expectedState,
          newState,
          { paymentIntentId }
        );
      }
    );
  }
}
