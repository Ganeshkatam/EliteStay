import {
  RawListingData,
  ListingHealthViewModel,
  ContributorScores,
} from '../view-models/listing-health.viewmodel';
import { MissingItem, PublishingPolicy } from '../policies/publishing.policy';

export enum ListingAction {
  ResumeBuild = 'resume_build',
  ManageCalendar = 'manage_calendar',
  AddPricing = 'add_pricing',
  AddImages = 'add_images',
  FixLocation = 'fix_location',
}

interface HealthContributorResult {
  score: number; // Max 100
  weight: number; // Relative importance (0-1)
  missingItems: MissingItem[];
  warnings: string[];
  recommendedAction?: ListingAction;
}

export class ListingHealthService {
  static evaluate(listing: RawListingData): ListingHealthViewModel {
    const isDraft = listing.status === 'draft' || listing.status === 'ready';
    const buildProgress = listing.listing_build_progress?.[0];
    const baseCompletion = buildProgress?.percent_complete ?? 0;

    const contentResult = this.evaluateContent(listing);
    const mediaResult = this.evaluateMedia(listing);
    const pricingResult = this.evaluatePricing(listing);
    const locationResult = this.evaluateLocation(listing);

    const contributors = [
      contentResult,
      mediaResult,
      pricingResult,
      locationResult,
    ];

    let totalScore = 0;
    let totalWeight = 0;
    const missingItems: MissingItem[] = [];
    const warnings: string[] = [];
    let primaryAction: ListingAction | null = null;

    for (const contributor of contributors) {
      totalScore += contributor.score * contributor.weight;
      totalWeight += contributor.weight;
      missingItems.push(...contributor.missingItems);
      warnings.push(...contributor.warnings);

      if (!primaryAction && contributor.recommendedAction) {
        primaryAction = contributor.recommendedAction;
      }
    }

    const finalScore =
      totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Evaluate publishing readiness using the PublishingPolicy
    const publishingDecision = PublishingPolicy.evaluate(missingItems);

    let status: ListingHealthViewModel['status'] = 'draft';
    if (!isDraft) {
      status = finalScore < 80 ? 'needs_attention' : 'healthy';
    } else {
      status = baseCompletion < 100 ? 'draft' : 'needs_attention';
    }

    if (!primaryAction) {
      primaryAction = isDraft
        ? ListingAction.ResumeBuild
        : ListingAction.ManageCalendar;
    }

    const contributorScores: ContributorScores = {
      content: contentResult.score,
      media: mediaResult.score,
      pricing: pricingResult.score,
      location: locationResult.score,
    };

    return {
      score: finalScore,
      status,
      completion: Math.max(baseCompletion, finalScore),
      missingItems,
      primaryAction,
      warnings,
      readyToPublish: publishingDecision.readyToPublish,
      contributors: contributorScores,
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
        section: 'amenities',
        message: 'Provide a title for the listing',
      });
    }
    if (!listing.description || listing.description.trim() === '') {
      score -= 50;
      missing.push({
        category: 'required',
        section: 'amenities',
        message: 'Provide a detailed description of the space',
      });
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
    const missing: MissingItem[] = [];
    const warnings: string[] = [];
    let score = 100;
    const imageCount = listing.images?.length || 0;

    if (imageCount === 0) {
      missing.push({
        category: 'required',
        section: 'photos',
        message: 'Upload at least one photo of the property',
      });
      score = 0;
    } else if (imageCount < 3) {
      score = 60;
      missing.push({
        category: 'recommended',
        section: 'photos',
        message: 'Upload 3 or more photos to increase booking inquiries',
      });
      warnings.push('Low photo count: listings with 3+ photos perform better.');
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
    const missing: MissingItem[] = [];
    let score = 100;
    const hasPrice = listing.prices && listing.prices.length > 0;

    if (!hasPrice) {
      missing.push({
        category: 'required',
        section: 'pricing',
        message: 'Set a monthly rent amount',
      });
      score = 0;
    }

    return {
      score,
      weight: 0.2,
      missingItems: missing,
      warnings: [],
      recommendedAction: !hasPrice ? ListingAction.AddPricing : undefined,
    };
  }

  private static evaluateLocation(
    listing: RawListingData
  ): HealthContributorResult {
    const missing: MissingItem[] = [];
    let score = 100;
    const hasLocation = listing.city && listing.locality;

    if (!hasLocation) {
      missing.push({
        category: 'required',
        section: 'location',
        message: 'Set property address (city and locality)',
      });
      score = 0;
    }

    return {
      score,
      weight: 0.2,
      missingItems: missing,
      warnings: [],
      recommendedAction: !hasLocation ? ListingAction.FixLocation : undefined,
    };
  }
}
