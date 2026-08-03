import { Database } from '@/types/database.types';

import { AvailabilityResult } from '../types/reservation.types';
import { ListingStatusPolicy } from '../policies/availability/listing-status.policy';
import { OccupancyPolicy } from '../policies/availability/occupancy.policy';
import { GenderPolicy } from '../policies/availability/gender.policy';
import { DurationPolicy } from '../policies/availability/duration.policy';
import { MoveInPolicy } from '../policies/availability/move-in.policy';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type ListingPricingRow = Database['public']['Tables']['listing_prices']['Row'];
type ListingAvailabilityRow =
  Database['public']['Tables']['listing_availability']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export class AvailabilityService {
  /**
   * Aggregates the 5 Availability Policies into a single AvailabilityResult.
   */
  static checkAvailability(
    listing: ListingRow | null,
    pricing: ListingPricingRow | null,
    availability: ListingAvailabilityRow | null,
    guestProfile: Pick<ProfileRow, 'gender'> | null,
    moveInDate: Date | null,
    duration: number | null
  ): AvailabilityResult {
    const reasons: string[] = [];

    // 1. Listing Status
    const statusCheck = ListingStatusPolicy.isValid(listing);
    if (!statusCheck.isValid) reasons.push(statusCheck.reason!);

    // 2. Occupancy
    const occupancyCheck = OccupancyPolicy.isValid(availability);
    if (!occupancyCheck.isValid) reasons.push(occupancyCheck.reason!);

    // 3. Gender
    const genderCheck = GenderPolicy.isValid(listing, guestProfile);
    if (!genderCheck.isValid) reasons.push(genderCheck.reason!);
    // Note: We ignore warnings here as they don't block availability

    // 4. Duration
    if (duration !== null) {
      const durationCheck = DurationPolicy.isValid(duration, pricing);
      if (!durationCheck.isValid) reasons.push(durationCheck.reason!);
    }

    // 5. Move-in Date
    if (moveInDate !== null) {
      const moveInCheck = MoveInPolicy.isValid(moveInDate, availability);
      if (!moveInCheck.isValid) reasons.push(moveInCheck.reason!);
    }

    return {
      isAvailable: reasons.length === 0,
      reasons,
      constraints: {
        minDuration: pricing?.minimum_duration ?? null,
        maxDuration: pricing?.maximum_duration ?? null,
        availableFrom: availability?.start_date
          ? new Date(availability.start_date)
          : null,
        maxOccupancy: availability?.available_units ?? null,
      },
    };
  }
}
