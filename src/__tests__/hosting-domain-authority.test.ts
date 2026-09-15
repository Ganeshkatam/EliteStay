import { describe, it, expect } from 'vitest';
import { HostingEligibilityPolicy } from '../features/hosting/policies/HostingEligibilityPolicy';
import { HostingOnboardingPolicy } from '../features/hosting/policies/HostingOnboardingPolicy';
import {
  ListingPublicationEligibilityPolicy,
  ListingPublicationContext,
} from '../features/hosting/policies/ListingPublicationEligibilityPolicy';
import { MANDATORY_HOST_POLICIES } from '../features/hosting/constants/hosting.constants';
import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
} from '../features/hosting/types/hosting.types';

describe('Hosting Domain Authority & Policy Enforcement', () => {
  const dummyDate = '2026-09-15T12:00:00.000Z';

  const createBaseProfile = (
    overrides: Partial<HostProfileRow> = {}
  ): HostProfileRow => ({
    id: 'hp_123',
    user_id: 'usr_123',
    status: 'ONBOARDING',
    primary_accommodation_type_id: null,
    bank_account_id: null,
    bank_name: null,
    bank_account_last4: null,
    tax_profile_id: null,
    tax_id_last4: null,
    tax_id_type: 'PAN',
    identity_submitted_at: dummyDate,
    identity_verification_status: 'UNVERIFIED',
    identity_verification_ref: null,
    identity_verified_at: null,
    payout_verification_status: 'UNVERIFIED',
    payout_verified_at: null,
    tax_verification_status: 'UNVERIFIED',
    tax_verified_at: null,
    agreed_to_policies_at: null,
    support_phone: '+919876543210',
    support_email: 'host@elitestay.test',
    created_at: dummyDate,
    updated_at: dummyDate,
    ...overrides,
  });

  const createValidAcceptances = (): HostPolicyAcceptanceRow[] => [
    {
      id: 'acc_1',
      host_profile_id: 'hp_123',
      policy_type: 'ANTI_DISCRIMINATION',
      policy_version: MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version,
      accepted_at: dummyDate,
      client_context: {},
      created_at: dummyDate,
    },
    {
      id: 'acc_2',
      host_profile_id: 'hp_123',
      policy_type: 'MAINTENANCE_SLA',
      policy_version: MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version,
      accepted_at: dummyDate,
      client_context: {},
      created_at: dummyDate,
    },
  ];

  describe('1. Canonical Policy Constants & Version Exactness', () => {
    it('defines mandatory policy versions', () => {
      expect(MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version).toBe(
        '2026.1'
      );
      expect(MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version).toBe('2026.1');
    });

    it('rejects outdated policy versions (e.g. 2025.1 does not satisfy 2026.1)', () => {
      const profile = createBaseProfile({
        primary_accommodation_type_id: 'acc_type_pg',
      });

      const outdatedAcceptances: HostPolicyAcceptanceRow[] = [
        {
          id: 'acc_old_1',
          host_profile_id: 'hp_123',
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2025.1', // Outdated version
          accepted_at: dummyDate,
          client_context: {},
          created_at: dummyDate,
        },
        {
          id: 'acc_old_2',
          host_profile_id: 'hp_123',
          policy_type: 'MAINTENANCE_SLA',
          policy_version: MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version,
          accepted_at: dummyDate,
          client_context: {},
          created_at: dummyDate,
        },
      ];

      const audit = HostingEligibilityPolicy.evaluate(
        profile,
        outdatedAcceptances
      );

      expect(audit.isEligible).toBe(false);
      expect(audit.hasPoliciesAgreedFact).toBe(false);
      expect(
        audit.missingRequirements.some((r) =>
          r.includes('Resident Anti-Discrimination & Fairness SLA (v2026.1)')
        )
      ).toBe(true);
    });
  });

  describe('2. HostOnboardingEligibilityPolicy Evaluation (3 Facts)', () => {
    it('evaluates null profile as ineligible with missing onboarding requirements', () => {
      const audit = HostingEligibilityPolicy.evaluate(null);
      expect(audit.isEligible).toBe(false);
      expect(audit.hasIdentitySubmittedFact).toBe(false);
      expect(audit.hasSpecializationFact).toBe(false);
      expect(audit.hasPoliciesAgreedFact).toBe(false);
      expect(audit.missingRequirements.length).toBeGreaterThanOrEqual(3);
    });

    it('STILL grants onboarding READY eligibility when bank, tax, and KYC are unverified (Decoupled Architecture)', () => {
      const onboardingProfile = createBaseProfile({
        identity_submitted_at: dummyDate,
        identity_verification_status: 'UNVERIFIED',
        payout_verification_status: 'UNVERIFIED',
        bank_name: null,
        tax_verification_status: 'UNVERIFIED',
        tax_id_last4: null,
        primary_accommodation_type_id: 'acc_type_pg',
      });

      const audit = HostingEligibilityPolicy.evaluate(
        onboardingProfile,
        createValidAcceptances()
      );

      expect(audit.isEligible).toBe(true);
      expect(audit.hasIdentitySubmittedFact).toBe(true);
      expect(audit.hasSpecializationFact).toBe(true);
      expect(audit.hasPoliciesAgreedFact).toBe(true);
      expect(audit.missingRequirements).toEqual([]);
    });

    it('rejects onboarding READY eligibility if identity declaration is missing', () => {
      const missingIdentityProfile = createBaseProfile({
        identity_submitted_at: null,
        primary_accommodation_type_id: 'acc_type_pg',
      });

      const audit = HostingEligibilityPolicy.evaluate(
        missingIdentityProfile,
        createValidAcceptances()
      );
      expect(audit.isEligible).toBe(false);
      expect(audit.hasIdentitySubmittedFact).toBe(false);
      expect(
        audit.missingRequirements.some((r) =>
          r.includes('Submit official host profile and contact details')
        )
      ).toBe(true);
    });

    it('rejects onboarding READY eligibility if accommodation specialization is missing', () => {
      const missingSpecProfile = createBaseProfile({
        identity_submitted_at: dummyDate,
        primary_accommodation_type_id: null,
      });

      const audit = HostingEligibilityPolicy.evaluate(
        missingSpecProfile,
        createValidAcceptances()
      );
      expect(audit.isEligible).toBe(false);
      expect(audit.hasSpecializationFact).toBe(false);
      expect(
        audit.missingRequirements.some((r) =>
          r.includes('Select primary accommodation specialization')
        )
      ).toBe(true);
    });
  });

  describe('3. ListingPublicationEligibilityPolicy (Host Compliance + Listing Health)', () => {
    const validListingContext: ListingPublicationContext = {
      id: 'list_123',
      title: 'Serene Student PG Living in Koramangala',
      description:
        'Fully furnished premium room with high-speed wifi, three meals daily, and 24x7 security.',
      accommodation_type_id: 'acc_type_pg',
      city: 'Bangalore',
      has_location: true,
      price: 15000,
      monthly_rent: 15000,
      images_count: 5,
    };

    it('rejects publication when host identity is not VERIFIED', () => {
      const hostProfile = createBaseProfile({
        status: 'READY',
        primary_accommodation_type_id: 'acc_type_pg',
        identity_verification_status: 'UNVERIFIED',
        bank_name: 'HDFC Bank',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_id_last4: '1234',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
      });

      const result = ListingPublicationEligibilityPolicy.evaluate(
        hostProfile,
        createValidAcceptances(),
        validListingContext
      );

      expect(result.eligible).toBe(false);
      expect(result.missingRequirements).toContain(
        'IDENTITY_VERIFICATION_REQUIRED'
      );
    });

    it('rejects publication when payout account is unverified or missing', () => {
      const hostProfile = createBaseProfile({
        status: 'READY',
        primary_accommodation_type_id: 'acc_type_pg',
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        bank_name: null,
        payout_verification_status: 'UNVERIFIED',
        tax_id_last4: '1234',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
      });

      const result = ListingPublicationEligibilityPolicy.evaluate(
        hostProfile,
        createValidAcceptances(),
        validListingContext
      );

      expect(result.eligible).toBe(false);
      expect(result.missingRequirements).toContain('PAYOUT_ACCOUNT_REQUIRED');
    });

    it('rejects publication when tax registration is unverified', () => {
      const hostProfile = createBaseProfile({
        status: 'READY',
        primary_accommodation_type_id: 'acc_type_pg',
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        bank_name: 'HDFC Bank',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_id_last4: null,
        tax_verification_status: 'UNVERIFIED',
      });

      const result = ListingPublicationEligibilityPolicy.evaluate(
        hostProfile,
        createValidAcceptances(),
        validListingContext
      );

      expect(result.eligible).toBe(false);
      expect(result.missingRequirements).toContain('TAX_REGISTRATION_REQUIRED');
    });

    it('rejects publication when listing health requirements fail (e.g. missing photos, missing price)', () => {
      const compliantHostProfile = createBaseProfile({
        status: 'READY',
        primary_accommodation_type_id: 'acc_type_pg',
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        bank_name: 'HDFC Bank',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_id_last4: '1234',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
      });

      const incompleteListing: ListingPublicationContext = {
        ...validListingContext,
        images_count: 0, // No photos
        price: null,
        monthly_rent: null,
      };

      const result = ListingPublicationEligibilityPolicy.evaluate(
        compliantHostProfile,
        createValidAcceptances(),
        incompleteListing
      );

      expect(result.eligible).toBe(false);
      expect(result.missingRequirements).toContain('LISTING_PHOTOS_REQUIRED');
      expect(result.missingRequirements).toContain('LISTING_PRICING_REQUIRED');
    });

    it('grants publication eligibility when both host compliance facts and listing health pass completely', () => {
      const compliantHostProfile = createBaseProfile({
        status: 'READY',
        primary_accommodation_type_id: 'acc_type_pg',
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        bank_name: 'HDFC Bank',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_id_last4: '1234',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
      });

      const result = ListingPublicationEligibilityPolicy.evaluate(
        compliantHostProfile,
        createValidAcceptances(),
        validListingContext
      );

      expect(result.eligible).toBe(true);
      expect(result.missingRequirements).toEqual([]);
      expect(result.hostRequirements.identityVerified).toBe(true);
      expect(result.hostRequirements.payoutVerified).toBe(true);
      expect(result.hostRequirements.taxVerified).toBe(true);
      expect(result.listingRequirements.contentComplete).toBe(true);
    });
  });

  describe('4. HostingOnboardingPolicy Strict 3-Step Machine', () => {
    it('enforces step entry prerequisite rules', () => {
      const audit = HostingEligibilityPolicy.evaluate(null);

      // Not started or initial state
      expect(
        HostingOnboardingPolicy.canEnterStep('identity', null, audit)
      ).toBe(true);
      expect(
        HostingOnboardingPolicy.canEnterStep('specialization', null, audit)
      ).toBe(false);
      expect(
        HostingOnboardingPolicy.canEnterStep('policies', null, audit)
      ).toBe(false);

      const identitySubmittedProfile = createBaseProfile({
        identity_submitted_at: dummyDate,
        primary_accommodation_type_id: null,
      });
      const audit2 = HostingEligibilityPolicy.evaluate(
        identitySubmittedProfile,
        []
      );

      expect(
        HostingOnboardingPolicy.canEnterStep(
          'specialization',
          identitySubmittedProfile,
          audit2
        )
      ).toBe(true);
      expect(
        HostingOnboardingPolicy.canEnterStep(
          'policies',
          identitySubmittedProfile,
          audit2
        )
      ).toBe(false);
    });

    it('permits transition to READY when 3 onboarding facts are satisfied', () => {
      const readyProfile = createBaseProfile({
        identity_submitted_at: dummyDate,
        primary_accommodation_type_id: 'acc_type_pg',
      });
      const audit = HostingEligibilityPolicy.evaluate(
        readyProfile,
        createValidAcceptances()
      );

      expect(
        HostingOnboardingPolicy.canTransitionToReady(readyProfile, audit)
      ).toBe(true);
    });
  });
});
