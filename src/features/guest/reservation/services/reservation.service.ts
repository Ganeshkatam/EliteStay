import { ReservationRepository } from '../repositories/reservation.repository';
import { AvailabilityService } from './availability.service';
import { PricingService } from './pricing.service';
import {
  ReservationViewModelFactory,
  ReservationViewModel,
} from '../view-models/reservation.viewmodel';
import { ReservationState, GuestDetails } from '../types/reservation.types';
import { Database } from '@/types/database.types';

export class ReservationService {
  /**
   * Orchestrates the creation of a ReservationViewModel from raw database state.
   */
  static async getReservationViewModel(
    publicId: string,
    moveInDate: Date | null,
    duration: number | null,
    guestProfile: Pick<
      Database['public']['Tables']['profiles']['Row'],
      'gender'
    > | null, // passed from auth context
    guestDetails: GuestDetails | null, // passed from client state
    currentState: ReservationState
  ): Promise<ReservationViewModel | null> {
    // 1. Fetch raw data
    const listingData =
      await ReservationRepository.getListingForReservation(publicId);
    if (!listingData) {
      return null; // Not found or not published
    }

    // 2. Extract relations
    const pricing =
      listingData.pricing && listingData.pricing.length > 0
        ? listingData.pricing[0]
        : null;
    const availability =
      listingData.availability && listingData.availability.length > 0
        ? listingData.availability[0]
        : null;

    // 3. Evaluate Policies
    const availabilityResult = AvailabilityService.checkAvailability(
      listingData,
      pricing,
      availability,
      guestProfile,
      moveInDate,
      duration
    );

    const priceQuote = PricingService.getQuote(pricing, duration);

    // 4. Compose ViewModel
    return ReservationViewModelFactory.create(
      listingData,
      moveInDate,
      duration,
      availabilityResult,
      priceQuote,
      guestDetails,
      currentState
    );
  }
}
