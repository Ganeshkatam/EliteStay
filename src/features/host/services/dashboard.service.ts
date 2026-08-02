import {
  AttentionItem,
  DashboardKPIs,
  QuickAction,
} from '../view-models/dashboard.viewmodel';
import { RawListingData } from '../view-models/listing-health.viewmodel';
import { ListingHealthService, ListingAction } from './listing-health.service';

export class DashboardService {
  static getKPIs(
    listings: RawListingData[],
    pendingBookingsCount: number
  ): DashboardKPIs {
    const evaluatedListings = listings.map((l) =>
      ListingHealthService.evaluate(l)
    );
    const publishedCount = listings.filter(
      (l) => l.status === 'published'
    ).length;
    const draftsCount = evaluatedListings.filter(
      (h) => h.status === 'draft'
    ).length;

    return {
      publishedCount,
      draftsCount,
      pendingBookingsCount,
    };
  }

  static getAttentionItems(
    listings: RawListingData[],
    pendingBookingsCount: number
  ): AttentionItem[] {
    const items: AttentionItem[] = [];

    if (pendingBookingsCount > 0) {
      items.push({
        id: 'pending_bookings',
        title: `${pendingBookingsCount} booking request${pendingBookingsCount > 1 ? 's' : ''} to review`,
        type: 'urgent',
        href: '/host/bookings',
      });
    }

    listings.forEach((listing) => {
      const health = ListingHealthService.evaluate(listing);
      const title = listing.title || 'Untitled Listing';

      if (health.status === 'needs_attention') {
        const warningMsg =
          health.warnings.length > 0
            ? health.warnings[0]
            : 'Missing required information';

        let href = `/host/listings/${listing.id}/edit`;
        if (health.primaryAction === ListingAction.ResumeBuild) {
          const step =
            listing.listing_build_progress?.[0]?.last_step || 'accommodation';
          href = `/host/listings/${listing.id}/build/${step}`;
        } else if (health.primaryAction === ListingAction.AddImages) {
          href = `/host/listings/${listing.id}/build/photos`;
        } else if (health.primaryAction === ListingAction.AddPricing) {
          href = `/host/listings/${listing.id}/build/pricing`;
        }

        items.push({
          id: `attention_${listing.id}`,
          title: `"${title}" needs attention: ${warningMsg}`,
          type: 'urgent',
          href,
        });
      } else if (health.status === 'draft') {
        const step =
          listing.listing_build_progress?.[0]?.last_step || 'accommodation';
        items.push({
          id: `draft_${listing.id}`,
          title: `Finish setting up "${title}" (${health.completion}% complete)`,
          type: 'warning',
          href: `/host/listings/${listing.id}/build/${step}`,
        });
      }
    });

    if (items.length === 0) {
      items.push({
        id: 'all_good',
        title: "You're all caught up for today.",
        type: 'success',
        href: null,
      });
    }

    return items;
  }

  static getQuickActions(
    listings: RawListingData[],
    pendingBookingsCount: number
  ): QuickAction[] {
    const actions: QuickAction[] = [];
    const evaluatedListings = listings.map((l) => ({
      listing: l,
      health: ListingHealthService.evaluate(l),
    }));

    const publishedListings = listings.filter((l) => l.status === 'published');
    const activeDrafts = evaluatedListings.filter(
      (e) => e.health.status === 'draft'
    );

    if (listings.length === 0) {
      actions.push({
        id: 'create_first',
        title: 'Create your first listing',
        icon: 'file-edit',
        href: '/host/listings/new',
        actionText: 'Create Listing',
      });
    } else if (publishedListings.length === 0 && activeDrafts.length > 0) {
      const draft = activeDrafts[0].listing;
      const step =
        draft.listing_build_progress?.[0]?.last_step || 'accommodation';
      actions.push({
        id: 'complete_first',
        title: 'Complete your first listing',
        icon: 'file-edit',
        href: `/host/listings/${draft.id}/build/${step}`,
        actionText: 'Resume Build',
      });
    } else {
      actions.push({
        id: 'create_new',
        title: 'Create new listing',
        icon: 'file-edit',
        href: '/host/listings/new',
        actionText: 'Create New',
      });
    }

    if (pendingBookingsCount > 0) {
      actions.push({
        id: 'review_bookings',
        title: 'Review pending bookings',
        icon: 'calendar',
        href: '/host/bookings',
        actionText: 'Review Now',
      });
    }

    if (publishedListings.length > 0) {
      actions.push({
        id: 'manage_availability',
        title: 'Manage Availability',
        icon: 'calendar',
        href: '/host/calendar',
        actionText: 'Open Calendar',
      });
    }

    actions.push({
      id: 'settings',
      title: 'Host Settings',
      icon: 'settings',
      href: '/host/settings',
      actionText: 'Configure',
    });

    return actions;
  }
}
