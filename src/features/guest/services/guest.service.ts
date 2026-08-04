// src/features/guest/services/guest.service.ts

/**
 * GuestService Facade
 *
 * Orchestrates all domain interactions for the Guest bounded context.
 * Follows the Thin Route Rule: Routes only call this service to get ViewModels.
 */
import { SearchFacade } from '@/features/search/services/SearchFacade';
import { type SearchFilters } from '@/features/search/lib/search-params';

import { ListingGuestService } from '@/features/guest/discovery/listing-details/services/ListingGuestService';
import { ReservationService } from '@/features/guest/reservation/services/reservation.service';
import {
  ReservationState,
  type ReservationIntent,
} from '@/features/guest/reservation/types/reservation.types';
import { Database } from '@/types/database.types';

export class GuestService {
  /**
   * Retrieves the view model for the Guest Home Page
   */
  static async getHomeData() {
    // TODO: Delegate to HomeService
    return {
      title: 'Find your next premium stay',
    };
  }

  /**
   * Retrieves the view model for the Guest Search Page
   */
  static async getSearchData(filters: SearchFilters) {
    return await SearchFacade.getPageData(filters);
  }

  /**
   * Retrieves the view model for the Guest Listing Details Page (PDP)
   */
  static async getListingDetails(listingId: string) {
    return await ListingGuestService.getListingDetails(listingId);
  }

  /**
   * Initializes a new Reservation Intent by fetching the necessary raw data
   * to power the client-side state machine.
   */
  static async createReservationIntent(
    publicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _guestProfile: Pick<
      Database['public']['Tables']['profiles']['Row'],
      'gender'
    > | null = null
  ) {
    // For Sprint 1, the client machine needs raw policies (pricing/availability rules).
    const { ReservationRepository } =
      await import('@/features/guest/reservation/repositories/reservation.repository');
    return await ReservationRepository.getListingForReservation(publicId);
  }

  /**
   * Validates an existing Reservation Intent and returns an updated view model
   */
  static async validateReservation(
    intent: ReservationIntent,
    guestProfile: Pick<
      Database['public']['Tables']['profiles']['Row'],
      'gender'
    > | null = null
  ) {
    return await ReservationService.getReservationViewModel(
      intent.listingId,
      intent.moveInDate,
      intent.duration,
      guestProfile,
      intent.guestDetails || null,
      ReservationState.DRAFT // State machine manages actual state client-side
    );
  }

  /**
   * Prepares the intent for booking persistence (Sprint 2)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async prepareBooking(_intent: ReservationIntent) {
    // Sprint 2 implementation
    throw new Error('Not implemented yet');
  }
}
