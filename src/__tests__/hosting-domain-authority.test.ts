import { describe, it, expect } from 'vitest';
import { HostingEligibilityPolicy } from '../features/hosting/policies/HostingEligibilityPolicy';
import { HostingOnboardingPolicy } from '../features/hosting/policies/HostingOnboardingPolicy';
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
    bank_name: 'HDFC Bank',
    bank_account_last4: '1234',
    tax_profile_id: null,
    tax_id_last4: '4321',
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
      const fullyVerifiedProfile = createBaseProfile({
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
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
        fullyVerifiedProfile,
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

  describe('2. HostingEligibilityPolicy Deterministic Evaluation', () => {
    it('evaluates null profile as completely ineligible with all 5 missing categories', () => {
      const audit = HostingEligibilityPolicy.evaluate(null);
      expect(audit.isEligible).toBe(false);
      expect(audit.hasIdentityVerifiedFact).toBe(false);
      expect(audit.hasBankLinkedFact).toBe(false);
      expect(audit.hasTaxRegisteredFact).toBe(false);
      expect(audit.hasSpecializationFact).toBe(false);
      expect(audit.hasPoliciesAgreedFact).toBe(false);
      expect(audit.missingRequirements.length).toBe(5);
    });

    it('rejects self-declared or unverified identity facts', () => {
      const profile = createBaseProfile({
        identity_submitted_at: dummyDate,
        identity_verification_status: 'PENDING',
        identity_verified_at: null,
      });

      const audit = HostingEligibilityPolicy.evaluate(profile, []);
      expect(audit.isEligible).toBe(false);
      expect(audit.hasIdentityVerifiedFact).toBe(false);
    });

    it('rejects unverified payout or tax profiles', () => {
      const profile = createBaseProfile({
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        payout_verification_status: 'UNVERIFIED',
        payout_verified_at: null,
        tax_verification_status: 'UNVERIFIED',
        tax_verified_at: null,
        primary_accommodation_type_id: 'acc_type_pg',
      });

      const audit = HostingEligibilityPolicy.evaluate(
        profile,
        createValidAcceptances()
      );
      expect(audit.isEligible).toBe(false);
      expect(audit.hasBankLinkedFact).toBe(false);
      expect(audit.hasTaxRegisteredFact).toBe(false);
    });

    it('grants eligibility when all 5 authoritative facts are satisfied', () => {
      const fullyVerifiedProfile = createBaseProfile({
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
        primary_accommodation_type_id: 'acc_type_pg',
      });

      const audit = HostingEligibilityPolicy.evaluate(
        fullyVerifiedProfile,
        createValidAcceptances()
      );

      expect(audit.isEligible).toBe(true);
      expect(audit.hasIdentityVerifiedFact).toBe(true);
      expect(audit.hasBankLinkedFact).toBe(true);
      expect(audit.hasTaxRegisteredFact).toBe(true);
      expect(audit.hasSpecializationFact).toBe(true);
      expect(audit.hasPoliciesAgreedFact).toBe(true);
      expect(audit.missingRequirements).toEqual([]);
    });
  });

  describe('3. HostingOnboardingPolicy Strict Step Machine', () => {
    it('enforces step entry prerequisite rules', () => {
      const audit = HostingEligibilityPolicy.evaluate(null);

      // Not started or initial state
      expect(
        HostingOnboardingPolicy.canEnterStep('eligibility', null, audit)
      ).toBe(true);
      expect(
        HostingOnboardingPolicy.canEnterStep('identity', null, audit)
      ).toBe(true);
      expect(HostingOnboardingPolicy.canEnterStep('bank', null, audit)).toBe(
        false
      );

      const identitySubmittedProfile = createBaseProfile({
        identity_submitted_at: dummyDate,
        bank_name: null,
      });
      const audit2 = HostingEligibilityPolicy.evaluate(
        identitySubmittedProfile,
        []
      );

      expect(
        HostingOnboardingPolicy.canEnterStep(
          'bank',
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

    it('blocks transition to READY if not all requirements are fulfilled', () => {
      const unverifiedProfile = createBaseProfile();
      const audit = HostingEligibilityPolicy.evaluate(unverifiedProfile, []);

      const canTransition = HostingOnboardingPolicy.canTransitionToReady(
        unverifiedProfile,
        audit
      );
      expect(canTransition).toBe(false);
    });

    it('permits transition to READY only when ONBOARDING status and eligible', () => {
      const readyProfile = createBaseProfile({
        identity_verification_status: 'VERIFIED',
        identity_verified_at: dummyDate,
        payout_verification_status: 'VERIFIED',
        payout_verified_at: dummyDate,
        tax_verification_status: 'VERIFIED',
        tax_verified_at: dummyDate,
        primary_accommodation_type_id: 'acc_type_pg',
      });
      const audit = HostingEligibilityPolicy.evaluate(
        readyProfile,
        createValidAcceptances()
      );

      expect(
        HostingOnboardingPolicy.canTransitionToReady(readyProfile, audit)
      ).toBe(true);

      // If status is already READY or ACTIVE, canTransitionToReady is false (idempotent / already transitioned)
      const alreadyReadyProfile = { ...readyProfile, status: 'READY' as const };
      expect(
        HostingOnboardingPolicy.canTransitionToReady(alreadyReadyProfile, audit)
      ).toBe(false);
    });
  });
});
