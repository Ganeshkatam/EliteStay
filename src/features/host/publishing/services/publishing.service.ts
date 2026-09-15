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
    const rawListingRows = await HostRepository.getListings(supabase, hostId);
    const listingRow = rawListingRows.find((l) => l.id === listingId);

    if (!listingRow) {
      throw new Error('Listing not found or unauthorized');
    }

    const rawListing = listingRow as unknown as RawListingData;

    // 1. Evaluate Listing Publication Eligibility Policy for early explanation & pre-check
    const { HostingRepository } =
      await import('@/features/hosting/repositories/hosting.repository');
    const hostingRepo = new HostingRepository();
    const hostProfileData = await hostingRepo.getHostProfileByUserId(hostId);
    const policyRows = hostProfileData
      ? await hostingRepo.getPolicyAcceptances(hostProfileData.id)
      : [];

    const { ListingPublicationEligibilityPolicy } =
      await import('@/features/hosting/policies/ListingPublicationEligibilityPolicy');
    const imagesCount =
      rawListing.images?.length || rawListing.listing_images?.length || 0;
    const priceAmount =
      rawListing.prices?.[0]?.amount ||
      rawListing.listing_prices?.[0]?.amount ||
      0;
    const hasLocation = Boolean(
      rawListing.city ||
      rawListing.locality ||
      (rawListing.listing_locations && rawListing.listing_locations.length > 0)
    );

    const publicationEligibility = ListingPublicationEligibilityPolicy.evaluate(
      hostProfileData,
      policyRows,
      {
        id: listingId,
        title: rawListing.title,
        images_count: imagesCount,
        price: priceAmount,
        has_location: hasLocation,
      }
    );

    if (!publicationEligibility.eligible) {
      throw new Error(
        `Cannot publish listing: missing mandatory requirements (${publicationEligibility.missingRequirements.join(', ')})`
      );
    }

    // 2. Sole Publication Authority: Execute transactional, row-locked publish_listing RPC
    const { data: rpcData, error: rpcError } = await (
      supabase.rpc as unknown as (
        name: string,
        params: { p_listing_id: string }
      ) => Promise<{
        data: {
          success: boolean;
          status?: string;
          error?: string;
          missing?: string[];
        } | null;
        error: { message: string } | null;
      }>
    )('publish_listing', {
      p_listing_id: listingId,
    });

    if (rpcError) {
      throw new Error('Failed to publish listing: ' + rpcError.message);
    }

    if (!rpcData || !rpcData.success) {
      const missingDetails = rpcData?.missing?.length
        ? ` (${rpcData.missing.join(', ')})`
        : '';
      throw new Error(
        `Publication rejected: ${rpcData?.error || 'Requirements not met'}${missingDetails}`
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
