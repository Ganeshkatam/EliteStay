// src/features/guest/services/guest.service.ts

/**
 * GuestService Facade
 *
 * Orchestrates all domain interactions for the Guest bounded context.
 * Follows the Thin Route Rule: Routes only call this service to get ViewModels.
 */
import { SearchFacade } from '@/features/search/services/SearchFacade';
import { type SearchFilters } from '@/features/search/lib/search-params';

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
    // TODO: Delegate to ListingGuestService
    return {
      listingId,
    };
  }

  /**
   * Retrieves the view model for the Guest Reservation Workspace
   */
  static async getReservation(listingId: string) {
    // TODO: Delegate to ReservationService
    return {
      listingId,
    };
  }
}
