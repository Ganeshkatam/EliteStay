import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import {
  ListingPublishingViewModel,
  PublishingSectionId,
  SidebarSection,
  RawListingData,
  ListingStatus,
} from '../view-models/listing-publishing.viewmodel';
import { ListingHealthService } from './listing-health.service';
import { PublishingPolicy } from '../policies/publishing.policy';
import { HostRepository } from '../../repositories/host.repository';
import { PublishingRepository } from '../repositories/publishing.repository';

export class PublishingService {
  /**
   * Retrieves all the data required for the Publishing Workspace, including the full
   * health evaluation and publishing decision.
   */
  static async getWorkspace(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ): Promise<ListingPublishingViewModel> {
    const rawListingRows = await HostRepository.getListings(supabase, hostId);
    const listingRow = rawListingRows.find((l) => l.id === listingId);

    if (!listingRow) {
      throw new Error('Listing not found or unauthorized');
    }

    const rawListing = listingRow as unknown as RawListingData;

    // 1. Evaluate Health
    const { health, missingItems } = ListingHealthService.evaluate(rawListing);

    // 2. Evaluate Publishing Readiness
    const publishingDecision = PublishingPolicy.evaluate(missingItems);

    // 3. Compute Sidebar Navigation
    const sidebar = this.computeSidebar(publishingDecision);

    return {
      listingId,
      title: rawListing.title || 'Untitled Listing',
      status: rawListing.status as ListingStatus,
      health,
      publishing: publishingDecision,
      sidebar,
    };
  }

  /**
   * Returns the ID of the section that needs attention first, or ACCOMMODATION if everything is ready.
   */
  static async getResumeSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ): Promise<PublishingSectionId> {
    const workspace = await this.getWorkspace(supabase, listingId, hostId);
    return (
      workspace.publishing.nextRequiredSection ||
      PublishingSectionId.ACCOMMODATION
    );
  }

  static async publish(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ): Promise<void> {
    const workspace = await this.getWorkspace(supabase, listingId, hostId);

    if (!workspace.publishing.ready) {
      throw new Error(
        'Cannot publish: listing does not meet minimum requirements.'
      );
    }

    const { error } = await supabase
      .from('listings')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('host_id', hostId);

    if (error) {
      throw new Error('Failed to publish listing: ' + error.message);
    }

    // Automatically transition host capability status from READY to ACTIVE upon first live listing via controlled transition RPC
    const { error: transitionError } = await (
      supabase.rpc as unknown as (
        name: string
      ) => Promise<{ error: { message: string } | null }>
    )('transition_host_to_active');
    if (transitionError) {
      console.warn(
        '[PublishingService] Note on host activation transition:',
        transitionError.message
      );
    }
  }

  static async unpublish(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('host_id', hostId);

    if (error) {
      throw new Error('Failed to unpublish listing: ' + error.message);
    }
  }

  private static computeSidebar(
    decision: ReturnType<typeof PublishingPolicy.evaluate>
  ): SidebarSection[] {
    const sections = [
      {
        id: PublishingSectionId.ACCOMMODATION,
        label: 'Accommodation',
        href: `/host/listings/[id]/build/accommodation`,
      },
      {
        id: PublishingSectionId.LOCATION,
        label: 'Location',
        href: `/host/listings/[id]/build/location`,
      },
      {
        id: PublishingSectionId.FEATURES,
        label: 'Features',
        href: `/host/listings/[id]/build/features`,
      },
      {
        id: PublishingSectionId.PRICING,
        label: 'Pricing',
        href: `/host/listings/[id]/build/pricing`,
      },
      {
        id: PublishingSectionId.IMAGES,
        label: 'Photos',
        href: `/host/listings/[id]/build/images`,
      },
    ];

    return sections.map((sec) => {
      // If the section is listed in required items, it's incomplete.
      // If it's listed in recommended items, it's a warning.
      // Otherwise, complete.
      const hasRequired = decision.required.some(
        (req) => req.sectionId === sec.id
      );
      const hasRecommended = decision.recommended.some(
        (rec) => rec.sectionId === sec.id
      );

      let status: SidebarSection['status'] = 'complete';
      if (hasRequired) status = 'incomplete';
      else if (hasRecommended) status = 'warning';

      return {
        ...sec,
        status,
      };
    });
  }

  static async getAccommodationSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    return PublishingRepository.getAccommodationSection(
      supabase,
      listingId,
      hostId
    );
  }

  static async getLocationSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    return PublishingRepository.getLocationSection(supabase, listingId, hostId);
  }

  static async getFeaturesSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    return PublishingRepository.getFeaturesSection(supabase, listingId, hostId);
  }

  static async getPricingSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    return PublishingRepository.getPricingSection(supabase, listingId, hostId);
  }

  static async getImagesSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    return PublishingRepository.getImagesSection(supabase, listingId, hostId);
  }
}
