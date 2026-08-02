export enum ListingMissingItem {
  Pricing = 'pricing',
  Images = 'images',
  Amenities = 'amenities',
  Availability = 'availability',
  Description = 'description',
  Location = 'location',
  Rules = 'rules',
  AccommodationType = 'accommodation_type',
}

export enum ListingAction {
  ResumeBuild = 'resume_build',
  ManageCalendar = 'manage_calendar',
  AddPricing = 'add_pricing',
  AddImages = 'add_images',
  FixLocation = 'fix_location',
}

export interface ListingWarning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ListingHealth {
  score: number; // 0-100
  status: 'healthy' | 'needs_attention' | 'draft';
  completion: number; // 0-100
  missingItems: ListingMissingItem[];
  primaryAction: ListingAction;
  warnings: ListingWarning[];
  readyToPublish: boolean;
}

export interface RawListingData {
  id: string;
  status: string;
  city?: string | null;
  locality?: string | null;
  title?: string | null;
  description?: string | null;
  images?: { storage_path: string }[] | null;
  prices?: { amount: number; billing_period: string }[] | null;
  amenities?: unknown[] | null;
  listing_build_progress?:
    { percent_complete: number; last_step: string }[] | null;
}

/**
 * Contributor interface for health calculations.
 * Each contributor (Content, Pricing, Media) evaluates a specific part of the listing.
 */
interface HealthContributorResult {
  score: number; // Max 100
  weight: number; // Relative importance (0-1)
  missingItems: ListingMissingItem[];
  warnings: ListingWarning[];
  recommendedAction?: ListingAction;
}

/**
 * Domain service for determining the operational health of a listing.
 * It uses a contributor pattern so new requirements (like min photos) can be added easily.
 */
export class ListingHealthService {
  /**
   * Evaluates the health of a listing by aggregating results from multiple contributors.
   */
  static evaluate(listing: RawListingData): ListingHealth {
    const isDraft = listing.status === 'draft' || listing.status === 'ready';
    const buildProgress = listing.listing_build_progress?.[0];

    // If it's a draft currently being built, the primary focus is completion.
    const baseCompletion = buildProgress?.percent_complete ?? 0;

    const contributors = [
      this.evaluateContent(listing),
      this.evaluateMedia(listing),
      this.evaluatePricing(listing),
      this.evaluateLocation(listing),
    ];

    let totalScore = 0;
    let totalWeight = 0;
    const missingItems: ListingMissingItem[] = [];
    const warnings: ListingWarning[] = [];
    let primaryAction: ListingAction | null = null;

    for (const contributor of contributors) {
      totalScore += contributor.score * contributor.weight;
      totalWeight += contributor.weight;
      missingItems.push(...contributor.missingItems);
      warnings.push(...contributor.warnings);

      // Determine primary action based on the first contributor that recommends one
      if (!primaryAction && contributor.recommendedAction) {
        primaryAction = contributor.recommendedAction;
      }
    }

    const finalScore =
      totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const readyToPublish = missingItems.length === 0 && finalScore >= 90;

    let status: ListingHealth['status'] = 'draft';
    if (!isDraft) {
      status =
        finalScore < 80 || warnings.some((w) => w.severity === 'high')
          ? 'needs_attention'
          : 'healthy';
    } else {
      status = baseCompletion < 100 ? 'draft' : 'needs_attention'; // Needs attention to publish
    }

    // Fallback action
    if (!primaryAction) {
      primaryAction = isDraft
        ? ListingAction.ResumeBuild
        : ListingAction.ManageCalendar;
    }

    return {
      score: finalScore,
      status,
      completion: Math.max(baseCompletion, finalScore), // Give credit for build progress
      missingItems,
      primaryAction,
      warnings,
      readyToPublish,
    };
  }

  // --- Contributors ---

  private static evaluateContent(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: ListingMissingItem[] = [];
    let score = 100;

    if (!listing.title || listing.title.trim() === '') {
      score -= 50;
    }
    if (!listing.description || listing.description.trim() === '') {
      missing.push(ListingMissingItem.Description);
      score -= 50;
    }

    return {
      score: Math.max(0, score),
      weight: 0.3,
      missingItems: missing,
      warnings: [],
      recommendedAction: score < 100 ? ListingAction.ResumeBuild : undefined,
    };
  }

  private static evaluateMedia(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: ListingMissingItem[] = [];
    const warnings: ListingWarning[] = [];
    let score = 100;
    const imageCount = listing.images?.length || 0;

    if (imageCount === 0) {
      missing.push(ListingMissingItem.Images);
      score = 0;
    } else if (imageCount < 3) {
      score = 60;
      warnings.push({
        code: 'LOW_PHOTO_COUNT',
        message: 'Listings with 3+ photos perform significantly better.',
        severity: 'medium',
      });
    }

    return {
      score,
      weight: 0.3,
      missingItems: missing,
      warnings,
      recommendedAction: imageCount === 0 ? ListingAction.AddImages : undefined,
    };
  }

  private static evaluatePricing(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: ListingMissingItem[] = [];
    let score = 100;

    if (!listing.prices || listing.prices.length === 0) {
      missing.push(ListingMissingItem.Pricing);
      score = 0;
    }

    return {
      score,
      weight: 0.2,
      missingItems: missing,
      warnings: [],
      recommendedAction: score === 0 ? ListingAction.AddPricing : undefined,
    };
  }

  private static evaluateLocation(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: ListingMissingItem[] = [];
    let score = 100;

    if (!listing.city || !listing.locality) {
      missing.push(ListingMissingItem.Location);
      score = 0;
    }

    return {
      score,
      weight: 0.2,
      missingItems: missing,
      warnings: [],
      recommendedAction: score === 0 ? ListingAction.FixLocation : undefined,
    };
  }
}
