import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, DomainEvent } from '@/lib/events/domain-events';
import { ReservationService } from '@/features/booking/services/reservation.service';
import { ApplicationRepository } from '../repositories/application.repository';
import { PricingService } from '@/features/booking/services/pricing.service';
import { BookingIntent } from '@/features/booking/types/booking.types';
import { v4 as uuidv4 } from 'uuid';
import { PropertyBaseService } from '@/features/property/services/property-base.service';

export function initializeApplicationEventHandlers() {
  eventBus.subscribe(
    DomainEventType.RENTAL_APPLICATION_APPROVED,
    async (event: unknown) => {
      const typedEvent = event as DomainEvent<{
        applicationId: string;
        propertyId: string;
        guestId: string;
      }>;
      console.log(
        `[ApplicationEvents] Processing RENTAL_APPLICATION_APPROVED for ${typedEvent.payload.applicationId}`
      );

      const { applicationId } = typedEvent.payload;
      const application = await ApplicationRepository.getById(applicationId);

      if (!application) {
        console.error(
          `[ApplicationEvents] Application ${applicationId} not found`
        );
        return;
      }

      const property = await PropertyBaseService.getBaseDetails(
        application.propertyId
      );
      if (!property) {
        console.error(
          `[ApplicationEvents] Property ${application.propertyId} not found`
        );
        return;
      }

      try {
        // Convert application to BookingIntent
        // Note: For rental applications, guestsCount might be 1 by default, or needs to be stored on application.
        // We will default to 1 if not present.
        const intent: BookingIntent = {
          propertyId: application.propertyId,
          moveInDate: application.moveInDate,
          leaseDurationMonths: application.leaseDurationMonths,
          guestsCount: 1, // Defaulting to 1, could be expanded later
          currency: 'INR', // Defaulting, could fetch from property
          channel: 'web',
          idempotencyKey: uuidv4(),
        };

        // 1. Snapshot Pricing
        const pricing = await PricingService.calculateAndSnapshot(intent);

        // 2. Create StayReservation
        await ReservationService.createDraft(
          application.guestId,
          intent,
          pricing
        );

        // Note: we leave it in DRAFT or we could move it to VALIDATED/LOCKED/PENDING_PAYMENT.
        // The business logic dictates that once approved, the tenant must pay the deposit.
        // So a Draft/PendingPayment reservation is created.

        console.log(
          `[ApplicationEvents] StayReservation created for application ${applicationId}`
        );
      } catch (error) {
        console.error(
          `[ApplicationEvents] Failed to create StayReservation for ${applicationId}`,
          error
        );
      }
    }
  );
}
