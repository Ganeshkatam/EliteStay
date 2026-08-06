import { PaymentRepository } from '../repositories/payment.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { PaymentProvider } from '../providers/payment-provider';
import { MockPaymentProvider } from '../providers/mock-payment-provider';
import { StayReservation } from '../types/booking.types';
import { observeService } from '@/lib/observability/decorators/observe-service';
import {
  EventBus,
  PaymentAuthorized,
  BookingConfirmed,
  BookingCancelled,
} from '../events/event-bus';

// Inject provider (in a real DI container this would be provided)
const paymentProvider: PaymentProvider = new MockPaymentProvider();

export class PaymentService {
  /**
   * Authorizes payment and transitions to PAYMENT_AUTHORIZED.
   */
  static async authorizePayment(
    reservation: StayReservation
  ): Promise<StayReservation> {
    return observeService('PaymentService', 'authorizePayment', async () => {
      // 1. Transition to PENDING_PAYMENT to indicate we're calling external service
      let activeReservation = await BookingRepository.transitionState(
        reservation,
        'LOCKED',
        'PENDING_PAYMENT'
      );

      try {
        // 2. Call external provider
        const intent = await paymentProvider.authorize(
          activeReservation.pricing.totalInitialPayment,
          activeReservation.pricing.currency,
          activeReservation.id
        );

        // 3. Update reservation with intent ID and new state
        activeReservation = await PaymentRepository.setPaymentIntent(
          activeReservation,
          intent.id,
          'PENDING_PAYMENT',
          'PAYMENT_AUTHORIZED'
        );

        EventBus.stage(
          new PaymentAuthorized(
            activeReservation.id,
            intent.id,
            activeReservation.idempotencyKey
          )
        );

        return activeReservation;
      } catch (error) {
        // Fallback state on failure
        activeReservation = await BookingRepository.transitionState(
          activeReservation,
          'PENDING_PAYMENT',
          'PAYMENT_FAILED'
        );
        throw error;
      }
    });
  }

  /**
   * Captures an authorized payment and confirms the booking.
   */
  static async captureAndConfirm(
    reservation: StayReservation
  ): Promise<StayReservation> {
    return observeService('PaymentService', 'captureAndConfirm', async () => {
      if (!reservation.paymentIntentId) {
        throw new Error('No payment intent to capture.');
      }

      const activeReservation = await BookingRepository.transitionState(
        reservation,
        'PAYMENT_AUTHORIZED',
        'CONFIRMED'
      );

      const captured = await paymentProvider.capture(
        reservation.paymentIntentId
      );
      if (!captured) {
        // In reality, this requires manual intervention or refund queueing if it fails post-confirmation
        // But for our state machine, we'll revert to FAILED or leave it for reconciliation.
        throw new Error(
          `Failed to capture payment intent ${reservation.paymentIntentId}`
        );
      }

      EventBus.stage(
        new BookingConfirmed(
          activeReservation.id,
          activeReservation.propertyId,
          activeReservation.guestId,
          activeReservation.pricing.snapshotJson.version,
          activeReservation.idempotencyKey
        )
      );

      return activeReservation;
    });
  }

  static async cancelPayment(
    reservation: StayReservation,
    reason: string
  ): Promise<StayReservation> {
    return observeService('PaymentService', 'cancelPayment', async () => {
      const activeReservation = await BookingRepository.transitionState(
        reservation,
        reservation.status, // We assume it's in a cancellable state, ideally we check
        'CANCELLED'
      );

      if (reservation.paymentIntentId) {
        await paymentProvider.cancel(reservation.paymentIntentId);
      }

      EventBus.stage(
        new BookingCancelled(
          activeReservation.id,
          reason,
          activeReservation.idempotencyKey
        )
      );

      return activeReservation;
    });
  }
}
