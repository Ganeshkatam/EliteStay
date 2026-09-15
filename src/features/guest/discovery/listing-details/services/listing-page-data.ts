import { cache } from 'react';
import { GuestService } from '@/features/guest/services/guest.service';

/**
 * Request-scoped memoized data loader for listing details.
 * Uses publicId primitive to deduplicate work between generateMetadata() and ListingPage().
 */
export const getListingPageData = cache(async (publicId: string) => {
  return GuestService.getListingDetails(publicId);
});
