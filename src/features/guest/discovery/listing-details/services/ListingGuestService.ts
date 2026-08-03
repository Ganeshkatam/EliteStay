import { getListingDetail } from '@/features/listings/api/queries';
import { ListingDetailsViewModel } from '../types';

export class ListingGuestService {
  /**
   * Orchestrates data retrieval for the Guest Listing Details Page (PDP)
   */
  static async getListingDetails(
    publicId: string
  ): Promise<ListingDetailsViewModel | null> {
    const listing = await getListingDetail(publicId);
    if (!listing) return null;

    return {
      listing,
      metadata: {
        title: `${listing.title} - EliteStay`,
        description:
          listing.description ||
          `Stay at this ${listing.accommodationType} in ${listing.location.city}`,
        canonical: `https://elitestay.com/stay/${listing.publicId}`,
      },
    };
  }
}
