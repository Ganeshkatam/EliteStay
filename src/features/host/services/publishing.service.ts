import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { HostRepository } from '../repositories/host.repository';
import { ListingHealthService } from './listing-health.service';
import { RawListingData } from '../view-models/listing-health.viewmodel';

export class PublishingService {
  static async publishListing(
    supabase: SupabaseClient<Database>,
    listing: RawListingData
  ) {
    const health = ListingHealthService.evaluate(listing);
    if (!health.readyToPublish) {
      throw new Error(
        'Listing is not eligible for publishing. Complete all required fields.'
      );
    }

    return await HostRepository.updateListingStatus(
      supabase,
      listing.id,
      'published'
    );
  }

  static async unpublishListing(
    supabase: SupabaseClient<Database>,
    listingId: string
  ) {
    return await HostRepository.updateListingStatus(
      supabase,
      listingId,
      'draft'
    );
  }
}
