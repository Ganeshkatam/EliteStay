import { Database } from '@/types/database.types';

type ListingRow = Database['public']['Tables']['listings']['Row'];

export class ListingStatusPolicy {
  static isValid(listing: ListingRow | null): {
    isValid: boolean;
    reason?: string;
  } {
    if (!listing) {
      return { isValid: false, reason: 'Listing not found.' };
    }

    if (listing.status !== 'published') {
      return { isValid: false, reason: 'This listing is no longer available.' };
    }

    return { isValid: true };
  }
}
