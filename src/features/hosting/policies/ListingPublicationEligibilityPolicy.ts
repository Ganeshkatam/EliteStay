import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
  ListingPublicationEligibility,
  PublicationRequirement,
} from '../types/hosting.types';
import { MANDATORY_HOST_POLICIES } from '../constants/hosting.constants';

export interface ListingPublicationContext {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  monthly_rent?: number | null;
  images_count?: number;
  has_location?: boolean;
  city?: string | null;
  accommodation_type_id?: string | null;
}

/**
 * Domain Policy governing live listing publication capability.
 * Answers: "Can this specific listing transition from draft to published/active?"
 * Evaluates host compliance facts alongside listing content health facts.
 */
export class ListingPublicationEligibilityPolicy {
  public static evaluate(
    hostProfile: HostProfileRow | null,
    policyAcceptances: HostPolicyAcceptanceRow[] = [],
    listing: ListingPublicationContext | null = null
  ): ListingPublicationEligibility {
    const evaluatedAt = new Date().toISOString();
    const missing: PublicationRequirement[] = [];

    // 1. Host Compliance Evaluations
    const identityVerified = Boolean(
      hostProfile &&
      hostProfile.identity_verification_status === 'VERIFIED' &&
      hostProfile.identity_verified_at
    );
    if (!identityVerified) {
      missing.push('IDENTITY_VERIFICATION_REQUIRED');
    }

    const hasPayoutAccount = Boolean(
      hostProfile && (hostProfile.bank_name || hostProfile.bank_account_last4)
    );
    if (!hasPayoutAccount) {
      missing.push('PAYOUT_ACCOUNT_REQUIRED');
    }

    const payoutVerified = Boolean(
      hostProfile &&
      hostProfile.payout_verification_status === 'VERIFIED' &&
      hostProfile.payout_verified_at
    );
    if (!payoutVerified) {
      missing.push('PAYOUT_VERIFICATION_REQUIRED');
    }

    const hasTaxRegistration = Boolean(
      hostProfile && (hostProfile.tax_id_last4 || hostProfile.tax_profile_id)
    );
    if (!hasTaxRegistration) {
      missing.push('TAX_REGISTRATION_REQUIRED');
    }

    const taxVerified = Boolean(
      hostProfile &&
      hostProfile.tax_verification_status === 'VERIFIED' &&
      hostProfile.tax_verified_at
    );
    if (!taxVerified) {
      missing.push('TAX_VERIFICATION_REQUIRED');
    }

    const specializationSet = Boolean(
      hostProfile && hostProfile.primary_accommodation_type_id
    );
    if (!specializationSet) {
      missing.push('SPECIALIZATION_REQUIRED');
    }

    const hasAcceptedAntiDiscrimination = policyAcceptances.some(
      (a) =>
        a.policy_type === 'ANTI_DISCRIMINATION' &&
        a.policy_version === MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version
    );

    const hasAcceptedMaintenanceSla = policyAcceptances.some(
      (a) =>
        a.policy_type === 'MAINTENANCE_SLA' &&
        a.policy_version === MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version
    );

    const policiesAgreed =
      hasAcceptedAntiDiscrimination && hasAcceptedMaintenanceSla;
    if (!policiesAgreed) {
      missing.push('POLICY_ACCEPTANCE_REQUIRED');
    }

    // 2. Listing Health & Completeness Evaluations
    let contentComplete = true;
    let photosPresent = true;
    let pricingConfigured = true;
    let locationComplete = true;

    if (listing) {
      contentComplete = Boolean(
        listing.title && listing.title.trim().length > 0
      );
      if (!contentComplete) {
        missing.push('LISTING_CONTENT_INCOMPLETE');
      }

      photosPresent = Boolean(
        listing.images_count !== undefined && listing.images_count >= 1
      );
      if (!photosPresent) {
        missing.push('LISTING_PHOTOS_REQUIRED');
      }

      pricingConfigured = Boolean(
        (listing.price && listing.price > 0) ||
        (listing.monthly_rent && listing.monthly_rent > 0)
      );
      if (!pricingConfigured) {
        missing.push('LISTING_PRICING_REQUIRED');
      }

      locationComplete = Boolean(listing.has_location || listing.city);
      if (!locationComplete) {
        missing.push('LISTING_LOCATION_REQUIRED');
      }
    }

    const eligible = missing.length === 0;

    return {
      eligible,
      missingRequirements: missing,
      evaluatedAt,
      hostRequirements: {
        identityVerified,
        payoutVerified,
        taxVerified,
        specializationSet,
        policiesAgreed,
      },
      listingRequirements: {
        contentComplete,
        photosPresent,
        pricingConfigured,
        locationComplete,
      },
    };
  }
}
