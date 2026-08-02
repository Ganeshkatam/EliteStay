import {
  RawListingData,
  ListingHealth,
  ContributorScore,
  HealthContributorId,
  PublishingSectionId,
  MissingItem,
} from '../view-models/listing-publishing.viewmodel';

export enum ListingAction {
  ResumeBuild = 'resume_build',
  AddImages = 'add_images',
  AddPricing = 'add_pricing',
  None = 'none',
}

interface HealthContributorResult {
  score: ContributorScore;
  missingItems: MissingItem[];
  warnings: string[];
}

export interface EvaluatedHealth {
  health: ListingHealth;
  missingItems: MissingItem[];
  status: 'healthy' | 'needs_attention' | 'draft';
  score: number;
  completion: number;
  warnings: string[];
  primaryAction: ListingAction;
  readyToPublish: boolean;
}

export class ListingHealthService {
  /**
   * Evaluates a listing's health score and returns the computed contributors
   * plus any missing items that should block or recommend publishing.
   */
  static evaluate(listing: RawListingData): EvaluatedHealth {
    const contentResult = this.evaluateContent(listing);
    const mediaResult = this.evaluateMedia(listing);
    const pricingResult = this.evaluatePricing(listing);
    const locationResult = this.evaluateLocation(listing);

    const contributors: ContributorScore[] = [
      contentResult.score,
      mediaResult.score,
      pricingResult.score,
      locationResult.score,
    ];

    let totalScore = 0;
    let totalWeight = 0;
    const missingItems: MissingItem[] = [];
    const allWarnings: string[] = [];

    for (const contributor of [
      contentResult,
      mediaResult,
      pricingResult,
      locationResult,
    ]) {
      totalScore += contributor.score.score * contributor.score.weight;
      totalWeight += contributor.score.weight;
      missingItems.push(...contributor.missingItems);
      allWarnings.push(...contributor.warnings);
    }

    const finalScore =
      totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const requiredMissing = missingItems.filter(
      (i) => i.category === 'required'
    );
    const readyToPublish = requiredMissing.length === 0;

    const warnings = [...requiredMissing.map((m) => m.message), ...allWarnings];

    let status: 'healthy' | 'needs_attention' | 'draft' = 'healthy';
    if (listing.status === 'draft') {
      status = 'draft';
    } else if (!readyToPublish || finalScore < 70) {
      status = 'needs_attention';
    }

    let primaryAction: ListingAction = ListingAction.None;
    if (
      listing.status === 'draft' ||
      contentResult.missingItems.length > 0 ||
      locationResult.missingItems.length > 0
    ) {
      primaryAction = ListingAction.ResumeBuild;
    } else if (mediaResult.missingItems.length > 0) {
      primaryAction = ListingAction.AddImages;
    } else if (pricingResult.missingItems.length > 0) {
      primaryAction = ListingAction.AddPricing;
    }

    return {
      health: {
        score: finalScore,
        contributors,
        evaluatedAt: new Date().toISOString(),
      },
      missingItems,
      status,
      score: finalScore,
      completion: finalScore,
      warnings,
      primaryAction,
      readyToPublish,
    };
  }

  private static evaluateContent(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: MissingItem[] = [];
    let score = 100;

    if (!listing.title || listing.title.trim() === '') {
      score -= 50;
      missing.push({
        category: 'required',
        sectionId: PublishingSectionId.ACCOMMODATION,
        message: 'Provide a title for the listing',
      });
    }
    if (!listing.description || listing.description.trim() === '') {
      score -= 50;
      missing.push({
        category: 'required',
        sectionId: PublishingSectionId.ACCOMMODATION,
        message: 'Provide a detailed description of the space',
      });
    }

    return {
      score: {
        id: HealthContributorId.CONTENT,
        label: 'Content',
        score: Math.max(0, score),
        weight: 30, // Using 0-100 scale for weights per user feedback
      },
      missingItems: missing,
      warnings: [],
    };
  }

  private static evaluateMedia(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: MissingItem[] = [];
    const warnings: string[] = [];
    let score = 100;
    const imageCount = (listing.listing_images || listing.images)?.length || 0;

    if (imageCount === 0) {
      missing.push({
        category: 'required',
        sectionId: PublishingSectionId.IMAGES,
        message: 'Upload at least one photo of the property',
      });
      score = 0;
    } else if (imageCount < 3) {
      score = 60;
      missing.push({
        category: 'recommended',
        sectionId: PublishingSectionId.IMAGES,
        message: 'Upload 3 or more photos to increase booking inquiries',
      });
      warnings.push('Low photo count: listings with 3+ photos perform better.');
    }

    return {
      score: {
        id: HealthContributorId.MEDIA,
        label: 'Media',
        score,
        weight: 30,
      },
      missingItems: missing,
      warnings,
    };
  }

  private static evaluatePricing(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: MissingItem[] = [];
    let score = 100;
    const prices = listing.listing_prices || listing.prices || [];
    const hasPrice = prices.length > 0;

    if (!hasPrice) {
      missing.push({
        category: 'required',
        sectionId: PublishingSectionId.PRICING,
        message: 'Set a monthly rent amount',
      });
      score = 0;
    }

    return {
      score: {
        id: HealthContributorId.PRICING,
        label: 'Pricing',
        score,
        weight: 20,
      },
      missingItems: missing,
      warnings: [],
    };
  }

  private static evaluateLocation(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: MissingItem[] = [];
    let score = 100;
    const hasLocation = listing.city && listing.locality;
    // We also check for listing_locations to be thorough, but city/locality are denormalized fields
    const hasLocationRows =
      listing.listing_locations && listing.listing_locations.length > 0;

    if (!hasLocation && !hasLocationRows) {
      missing.push({
        category: 'required',
        sectionId: PublishingSectionId.LOCATION,
        message: 'Set property address (city and locality)',
      });
      score = 0;
    }

    return {
      score: {
        id: HealthContributorId.LOCATION,
        label: 'Location',
        score,
        weight: 20,
      },
      missingItems: missing,
      warnings: [],
    };
  }
}
