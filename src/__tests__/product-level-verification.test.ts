import { describe, expect, it } from 'vitest';
import { HostingOnboardingPolicy } from '@/features/hosting/policies/HostingOnboardingPolicy';
import { HostOnboardingEligibilityPolicy } from '@/features/hosting/policies/HostingEligibilityPolicy';
import { ListingPublicationEligibilityPolicy } from '@/features/hosting/policies/ListingPublicationEligibilityPolicy';
import { MANDATORY_HOST_POLICIES } from '@/features/hosting/constants/hosting.constants';
import type { HostProfileRow, HostPolicyAcceptanceRow } from '@/features/hosting/types/hosting.types';

const timestamp = '2026-09-15T12:00:00.000Z';

function profile(overrides: Partial<HostProfileRow> = {}): HostProfileRow {
  return {
    id: 'host-profile-1',
    user_id: 'user-1',
    status: 'ONBOARDING',
    primary_accommodation_type_id: 'acc-pg',
    bank_account_id: null,
    bank_name: 'HDFC Bank',
    bank_account_last4: '1234',
    tax_profile_id: 'tax-1',
    tax_id_last4: '234C',
    tax_id_type: 'PAN',
    identity_submitted_at: timestamp,
    identity_verification_status: 'VERIFIED',
    identity_verification_ref: 'AADHAAR-1234',
    identity_verified_at: timestamp,
    payout_verification_status: 'VERIFIED',
    payout_verified_at: timestamp,
    tax_verification_status: 'VERIFIED',
    tax_verified_at: timestamp,
    agreed_to_policies_at: timestamp,
    support_phone: null,
    support_email: null,
    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
  };
}

function policies(version = MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version): HostPolicyAcceptanceRow[] {
  return [
    {
      id: 'policy-1',
      host_profile_id: 'host-profile-1',
      policy_type: 'ANTI_DISCRIMINATION',
      policy_version: version,
      accepted_at: timestamp,
      client_context: {},
      created_at: timestamp,
    },
    {
      id: 'policy-2',
      host_profile_id: 'host-profile-1',
      policy_type: 'MAINTENANCE_SLA',
      policy_version: MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version,
      accepted_at: timestamp,
      client_context: {},
      created_at: timestamp,
    },
  ];
}

describe('Product-Level Verification: Host -> Workspace -> Publication -> Discovery', () => {
  it('1. completes the three-step onboarding contract without requiring bank, tax, or KYC verification', () => {
    const onboardingProfile = profile({
      identity_verification_status: 'UNVERIFIED',
      identity_verified_at: null,
      payout_verification_status: 'UNVERIFIED',
      payout_verified_at: null,
      tax_verification_status: 'UNVERIFIED',
      tax_verified_at: null,
      bank_name: null,
      bank_account_last4: null,
      tax_profile_id: null,
      tax_id_last4: null,
    });

    const onboardingPolicies = policies();
    const audit = HostOnboardingEligibilityPolicy.evaluate(onboardingProfile, onboardingPolicies);

    expect(audit.isEligible).toBe(true);
    expect(
      HostingOnboardingPolicy.canTransitionToReady(onboardingProfile, audit)
    ).toBe(true);
  });

  it('2. rejects out-of-order onboarding navigation deterministically', () => {
    const incomplete = profile({
      identity_submitted_at: null,
      primary_accommodation_type_id: null,
    });
    const audit = HostOnboardingEligibilityPolicy.evaluate(incomplete, []);

    expect(HostingOnboardingPolicy.canEnterStep('specialization', incomplete, audit)).toBe(false);
    expect(HostingOnboardingPolicy.canEnterStep('policies', incomplete, audit)).toBe(false);
    expect(HostingOnboardingPolicy.canEnterStep('identity', incomplete, audit)).toBe(true);
  });

  it('3. keeps compliance submissions separate from verification authority', () => {
    const pending = profile({
      identity_verification_status: 'PENDING',
      identity_verified_at: null,
      payout_verification_status: 'PENDING',
      payout_verified_at: null,
      tax_verification_status: 'PENDING',
      tax_verified_at: null,
    });
    const result = ListingPublicationEligibilityPolicy.evaluate(
      pending,
      policies(),
      { id: 'listing-1', title: 'Complete Listing', images_count: 2, price: 10000, has_location: true }
    );

    expect(result.eligible).toBe(false);
    expect(result.missingRequirements).toEqual(
      expect.arrayContaining([
        'IDENTITY_VERIFICATION_REQUIRED',
        'PAYOUT_VERIFICATION_REQUIRED',
        'TAX_VERIFICATION_REQUIRED',
      ])
    );
  });

  it('4. rejects stale policy versions after a platform policy bump', () => {
    const stale = ListingPublicationEligibilityPolicy.evaluate(
      profile(),
      policies('2025.1'),
      { id: 'listing-1', title: 'Complete Listing', images_count: 2, price: 10000, has_location: true }
    );

    expect(stale.eligible).toBe(false);
    expect(stale.missingRequirements).toContain('POLICY_ACCEPTANCE_REQUIRED');
  });

  it('5. aggregates all actionable publication blockers instead of failing on the first one', () => {
    const result = ListingPublicationEligibilityPolicy.evaluate(
      profile({
        identity_verification_status: 'UNVERIFIED',
        identity_verified_at: null,
        payout_verification_status: 'UNVERIFIED',
        payout_verified_at: null,
        tax_verification_status: 'UNVERIFIED',
        tax_verified_at: null,
      }),
      [],
      { id: 'listing-1', title: '', images_count: 0, price: 0, has_location: false }
    );

    expect(result.eligible).toBe(false);
    expect(result.missingRequirements).toEqual(
      expect.arrayContaining([
        'IDENTITY_VERIFICATION_REQUIRED',
        'PAYOUT_VERIFICATION_REQUIRED',
        'TAX_VERIFICATION_REQUIRED',
        'POLICY_ACCEPTANCE_REQUIRED',
        'LISTING_CONTENT_INCOMPLETE',
        'LISTING_PHOTOS_REQUIRED',
        'LISTING_PRICING_REQUIRED',
        'LISTING_LOCATION_REQUIRED',
      ])
    );
  });

  it('6. allows publication only when every host and listing requirement is satisfied', () => {
    const result = ListingPublicationEligibilityPolicy.evaluate(
      profile(),
      policies(),
      {
        id: 'listing-1',
        title: 'Elite Residency Suites',
        description: 'Complete listing',
        price: 25000,
        images_count: 3,
        has_location: true,
        accommodation_type_id: 'acc-pg',
      }
    );

    expect(result.eligible).toBe(true);
    expect(result.missingRequirements).toHaveLength(0);
  });

  it('7. treats discovery as a published-state concern, never as an onboarding concern', () => {
    const draft = ListingPublicationEligibilityPolicy.evaluate(
      profile(),
      policies(),
      { id: 'listing-1', title: 'Draft Listing', images_count: 3, price: 25000, has_location: true }
    );

    expect(draft.eligible).toBe(true);
    expect(draft.eligible).not.toBe(false);
  });
});
