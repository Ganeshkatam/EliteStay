/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { LeaseService } from '../services/lease.service';
import { BookingRepository } from '@/features/booking/repositories/booking.repository';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

/**
 * Lease Event Handlers
 *
 * Lease drafts are created ONLY when a reservation is confirmed, not when
 * an application is approved. This ensures the transactional boundary is
 * the reservation -- an approved application can still fail due to
 * reservation conflicts, payment failures, or withdrawal.
 */
export function initializeLeaseEventHandlers() {
  eventBus.subscribe(
    DomainEventType.RESERVATION_CONFIRMED,
    async (event: DomainEvent<any>) => {
      try {
        const reservationId = event.payload.reservationId;
        if (!reservationId) {
          _logger.warn(
            'RESERVATION_CONFIRMED event missing reservationId payload',
            { eventId: event.id }
          );
          return;
        }

        // Fetch the confirmed reservation
        const reservation = await BookingRepository.getById(reservationId);
        if (!reservation) {
          _logger.error(
            `Reservation ${reservationId} not found for lease generation`,
            { eventId: event.id }
          );
          return;
        }

        // Calculate lease end date based on moveInDate + leaseDurationMonths
        const startDate = new Date(reservation.moveInDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + reservation.leaseDurationMonths);

        // Create Draft Lease with initial version
        await LeaseService.createDraftWithVersion({
          reservationId: reservation.id,
          tenantId: reservation.guestId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          monthlyRentAmount: reservation.pricing.monthlyRent,
          securityDepositAmount: reservation.pricing.securityDeposit,
          structuredData: {},
          documentUrl: null,
        });

        _logger.info('Draft Lease generated from confirmed reservation', {
          reservationId: reservation.id,
          tenantId: reservation.guestId,
        });
      } catch (error) {
        _logger.error(
          'Failed to handle RESERVATION_CONFIRMED for lease generation',
          { error }
        );
      }
    }
  );
}
