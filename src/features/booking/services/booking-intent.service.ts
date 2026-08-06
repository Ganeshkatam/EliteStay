import { BookingIntent } from '../types/booking.types';
import { ValidationError } from '@/lib/domain/errors';
import { parseISO, isValid } from 'date-fns';

export class BookingIntentService {
  /**
   * Validates the structure and logical rules of a Booking Intent.
   */
  static validate(intent: BookingIntent): void {
    if (!intent.propertyId || typeof intent.propertyId !== 'string') {
      throw new ValidationError('Invalid property ID');
    }
    if (!intent.idempotencyKey) {
      throw new ValidationError('Idempotency key is required');
    }

    const moveInDate = parseISO(intent.moveInDate);

    if (!isValid(moveInDate)) {
      throw new ValidationError('Invalid date format for moveInDate');
    }

    if (moveInDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new ValidationError('Move-in date cannot be in the past');
    }

    if (!intent.leaseDurationMonths || intent.leaseDurationMonths < 1) {
      throw new ValidationError('Lease duration must be at least 1 month');
    }

    if (!intent.guestsCount || intent.guestsCount < 1) {
      throw new ValidationError('Guest count must be at least 1');
    }

    if (!intent.currency) {
      throw new ValidationError('Currency is required');
    }

    if (!['web', 'ios', 'android', 'partner'].includes(intent.channel)) {
      throw new ValidationError('Invalid booking channel');
    }
  }
}
