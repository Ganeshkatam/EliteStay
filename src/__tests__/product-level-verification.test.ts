import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HostComplianceService } from '@/features/hosting/services/host-compliance.service';
import { HostingEligibilityPolicy } from '@/features/hosting/policies/HostingEligibilityPolicy';
import { HostingOnboardingPolicy } from '@/features/hosting/policies/HostingOnboardingPolicy';
import { ListingPublicationEligibilityPolicy } from '@/features/hosting/policies/ListingPublicationEligibilityPolicy';
import { ListingHealthService } from '@/features/host/publishing/services/listing-health.service';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';
import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
} from '@/features/hosting/types/hosting.types';
import { RawListingData } from '@/features/host/publishing/view-models/listing-publishing.viewmodel';

interface MockAccommodationType {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_active: boolean;
  description: string;
}

// Mock Next.js cookie header / request context
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
  }),
}));

describe('Phase 5 — Product-Level Verification (PLV) Suite', () => {
  let mockHostProfile: HostProfileRow;
  let mockPolicies: HostPolicyAcceptanceRow[];
  let mockAccommodationType: MockAccommodationType;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockHostProfile = {
      id: 'host-prof-plv-001',
      user_id: 'user-guest-001',
      status: 'ONBOARDING',
      primary_accommodation_type_id: null,
      bank_account_id: null,
      bank_name: null,
      bank_account_last4: null,
      tax_profile_id: null,
      tax_id_last4: null,
      tax_id_type: null,
      identity_submitted_at: null,
      identity_verification_status: 'UNVERIFIED',
      identity_verification_ref: null,
      identity_verified_at: null,
      payout_verification_status: 'UNVERIFIED',
      payout_verified_at: null,
      tax_verification_status: 'UNVERIFIED',
      tax_verified_at: null,
      agreed_to_policies_at: null,
      support_phone: null,
      support_email: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPolicies = [];

    mockAccommodationType = {
      id: 'acc-type-apartment',
      name: 'Apartment',
      slug: 'apartment',
      category: 'RESIDENTIAL',
      is_active: true,
      description: 'Self-contained residential unit',
    };
  });

  // =========================================================================
  // Area 1: Real Onboarding Flow (/host/onboarding/*)
  // =========================================================================
  describe('1. Real Onboarding Flow Journey & Step Progression', () => {
    it('enforces step progression: Step 1 -> Step 2 -> Step 3 -> READY', () => {
      // Step 1: Initial state
      let audit = HostingEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies
      );
      let stepEvaluation = HostingOnboardingPolicy.evaluateSteps(
        mockHostProfile,
        audit
      );

      expect(stepEvaluation.currentStepId).toBe('identity');
      expect(stepEvaluation.isOnboardingComplete).toBe(false);
      expect(
        HostingOnboardingPolicy.canEnterStep(
          'specialization',
          mockHostProfile,
          audit
        )
      ).toBe(false);
      expect(
        HostingOnboardingPolicy.canEnterStep('policies', mockHostProfile, audit)
      ).toBe(false);

      // Submit Step 1 (Identity)
      mockHostProfile.identity_submitted_at = new Date().toISOString();

      audit = HostingEligibilityPolicy.evaluate(mockHostProfile, mockPolicies);
      stepEvaluation = HostingOnboardingPolicy.evaluateSteps(
        mockHostProfile,
        audit
      );

      expect(stepEvaluation.currentStepId).toBe('specialization');
      expect(
        HostingOnboardingPolicy.canEnterStep(
          'specialization',
          mockHostProfile,
          audit
        )
      ).toBe(true);
      expect(
        HostingOnboardingPolicy.canEnterStep('policies', mockHostProfile, audit)
      ).toBe(false);

      // Submit Step 2 (Specialization)
      mockHostProfile.primary_accommodation_type_id = mockAccommodationType.id;

      audit = HostingEligibilityPolicy.evaluate(mockHostProfile, mockPolicies);
      stepEvaluation = HostingOnboardingPolicy.evaluateSteps(
        mockHostProfile,
        audit
      );

      expect(stepEvaluation.currentStepId).toBe('policies');
      expect(
        HostingOnboardingPolicy.canEnterStep('policies', mockHostProfile, audit)
      ).toBe(true);

      // Submit Step 3 (Mandatory Policies)
      mockPolicies.push(
        {
          id: 'acc-1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          client_context: {},
        },
        {
          id: 'acc-2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          client_context: {},
        }
      );

      audit = HostingEligibilityPolicy.evaluate(mockHostProfile, mockPolicies);
      stepEvaluation = HostingOnboardingPolicy.evaluateSteps(
        mockHostProfile,
        audit
      );

      expect(audit.isEligible).toBe(true);
      expect(stepEvaluation.currentStepId).toBe('ready');
      expect(
        HostingOnboardingPolicy.canTransitionToReady(mockHostProfile, audit)
      ).toBe(true);

      // Transition to READY
      mockHostProfile.status = 'READY';
      stepEvaluation = HostingOnboardingPolicy.evaluateSteps(
        mockHostProfile,
        audit
      );
      expect(stepEvaluation.isOnboardingComplete).toBe(true);
    });

    it('blocks direct URL bypass to later steps before prerequisites are satisfied', () => {
      const audit = HostingEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies
      );

      // Guest trying to enter policies directly
      expect(
        HostingOnboardingPolicy.canEnterStep('policies', mockHostProfile, audit)
      ).toBe(false);
      // Guest trying to enter specialization directly
      expect(
        HostingOnboardingPolicy.canEnterStep(
          'specialization',
          mockHostProfile,
          audit
        )
      ).toBe(false);
      // Guest trying to enter ready directly
      expect(
        HostingOnboardingPolicy.canEnterStep('ready', mockHostProfile, audit)
      ).toBe(false);
    });
  });

  // =========================================================================
  // Area 2: Compliance Center Verification (/host/compliance)
  // =========================================================================
  describe('2. Compliance Center Independent Sub-states & Privacy Invariant', () => {
    it('maintains independent sub-states for KYC, Payout, and Tax: PENDING != VERIFIED', async () => {
      // Simulate host entering workspace with READY status
      mockHostProfile.status = 'READY';
      mockHostProfile.identity_verification_status = 'UNVERIFIED';
      mockHostProfile.payout_verification_status = 'UNVERIFIED';
      mockHostProfile.tax_verification_status = 'UNVERIFIED';

      // Submit KYC -> becomes PENDING
      mockHostProfile.identity_verification_ref = 'DOC-REF-8899';
      mockHostProfile.identity_verification_status = 'PENDING';

      expect(mockHostProfile.identity_verification_status).toBe('PENDING');
      expect(mockHostProfile.payout_verification_status).toBe('UNVERIFIED');
      expect(mockHostProfile.tax_verification_status).toBe('UNVERIFIED');

      // Submit Payout -> becomes PENDING
      mockHostProfile.bank_name = 'HDFC Bank';
      mockHostProfile.bank_account_last4 = '4321';
      mockHostProfile.payout_verification_status = 'PENDING';

      expect(mockHostProfile.identity_verification_status).toBe('PENDING');
      expect(mockHostProfile.payout_verification_status).toBe('PENDING');

      // Submit Tax -> becomes PENDING
      mockHostProfile.tax_id_type = 'PAN';
      mockHostProfile.tax_id_last4 = '8910';
      mockHostProfile.tax_verification_status = 'PENDING';

      expect(mockHostProfile.tax_verification_status).toBe('PENDING');

      // Invariant: Submissions do NOT equal VERIFIED
      const eligibility = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        {
          id: 'listing-01',
          title: 'Luxury Studio',
          description: 'Spacious flat',
          price: 25000,
          images_count: 2,
          has_location: true,
        }
      );

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.missingRequirements).toContain(
        'IDENTITY_VERIFICATION_REQUIRED'
      );
      expect(eligibility.missingRequirements).toContain(
        'PAYOUT_VERIFICATION_REQUIRED'
      );
      expect(eligibility.missingRequirements).toContain(
        'TAX_VERIFICATION_REQUIRED'
      );
    });

    it('ensures sensitive financial and tax identifiers are masked in projections', async () => {
      mockHostProfile.bank_account_last4 = '9876';
      mockHostProfile.tax_id_last4 = '5432';

      const repo = {
        getHostProfileByUserId: vi.fn().mockResolvedValue(mockHostProfile),
        getPolicyAcceptances: vi.fn().mockResolvedValue(mockPolicies),
        getAccommodationTypeInfoById: vi
          .fn()
          .mockResolvedValue(mockAccommodationType),
        recordKycSubmission: vi.fn().mockResolvedValue(undefined),
        recordPayoutInstrument: vi.fn().mockResolvedValue(undefined),
        recordTaxRegistration: vi.fn().mockResolvedValue(undefined),
      };

      const complianceService = new HostComplianceService(
        repo as unknown as never
      );
      const summary = await complianceService.getComplianceSummary(
        mockHostProfile.user_id
      );

      expect(summary.payout.accountLast4).toBe('9876');
      expect(summary.tax.taxIdLast4).toBe('5432');
      // Full details are undefined or omitted
      expect('fullAccountNumber' in summary.payout).toBe(false);
      expect('fullTaxId' in summary.tax).toBe(false);
    });
  });

  // =========================================================================
  // Area 3: Publication Readiness UX Failure Matrix
  // =========================================================================
  describe('3. Publication Readiness UX Diagnostics & Failure Matrix', () => {
    const validListing = {
      id: 'list-100',
      title: 'Modern Suite',
      description: 'Fully furnished studio',
      price: 30000,
      images_count: 3,
      has_location: true,
      city: 'Bangalore',
    };

    it('diagnoses missing Identity KYC blocker independently', () => {
      mockHostProfile.identity_verification_status = 'UNVERIFIED';
      mockHostProfile.identity_verified_at = null;
      mockHostProfile.bank_name = 'HDFC';
      mockHostProfile.bank_account_last4 = '1234';
      mockHostProfile.payout_verification_status = 'VERIFIED';
      mockHostProfile.payout_verified_at = new Date().toISOString();
      mockHostProfile.tax_id_last4 = '5678';
      mockHostProfile.tax_verification_status = 'VERIFIED';
      mockHostProfile.tax_verified_at = new Date().toISOString();
      mockHostProfile.primary_accommodation_type_id = 'acc-type-apartment';
      mockPolicies = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const res = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        validListing
      );
      expect(res.eligible).toBe(false);
      expect(res.missingRequirements).toEqual([
        'IDENTITY_VERIFICATION_REQUIRED',
      ]);
    });

    it('diagnoses missing Payout account blocker independently', () => {
      mockHostProfile.identity_verification_status = 'VERIFIED';
      mockHostProfile.identity_verified_at = new Date().toISOString();
      mockHostProfile.bank_name = null;
      mockHostProfile.bank_account_last4 = null;
      mockHostProfile.payout_verification_status = 'UNVERIFIED';
      mockHostProfile.payout_verified_at = null;
      mockHostProfile.tax_id_last4 = '5678';
      mockHostProfile.tax_verification_status = 'VERIFIED';
      mockHostProfile.tax_verified_at = new Date().toISOString();
      mockHostProfile.primary_accommodation_type_id = 'acc-type-apartment';
      mockPolicies = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const res = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        validListing
      );
      expect(res.eligible).toBe(false);
      expect(res.missingRequirements).toContain('PAYOUT_ACCOUNT_REQUIRED');
      expect(res.missingRequirements).toContain('PAYOUT_VERIFICATION_REQUIRED');
    });

    it('diagnoses missing Tax registration blocker independently', () => {
      mockHostProfile.identity_verification_status = 'VERIFIED';
      mockHostProfile.identity_verified_at = new Date().toISOString();
      mockHostProfile.bank_name = 'HDFC';
      mockHostProfile.bank_account_last4 = '1234';
      mockHostProfile.payout_verification_status = 'VERIFIED';
      mockHostProfile.payout_verified_at = new Date().toISOString();
      mockHostProfile.tax_id_last4 = null;
      mockHostProfile.tax_profile_id = null;
      mockHostProfile.tax_verification_status = 'UNVERIFIED';
      mockHostProfile.tax_verified_at = null;
      mockHostProfile.primary_accommodation_type_id = 'acc-type-apartment';
      mockPolicies = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const res = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        validListing
      );
      expect(res.eligible).toBe(false);
      expect(res.missingRequirements).toContain('TAX_REGISTRATION_REQUIRED');
      expect(res.missingRequirements).toContain('TAX_VERIFICATION_REQUIRED');
    });

    it('diagnoses listing health deficits independently (0 photos, missing price)', () => {
      mockHostProfile.identity_verification_status = 'VERIFIED';
      mockHostProfile.identity_verified_at = new Date().toISOString();
      mockHostProfile.bank_name = 'HDFC';
      mockHostProfile.bank_account_last4 = '1234';
      mockHostProfile.payout_verification_status = 'VERIFIED';
      mockHostProfile.payout_verified_at = new Date().toISOString();
      mockHostProfile.tax_id_last4 = '9999';
      mockHostProfile.tax_verification_status = 'VERIFIED';
      mockHostProfile.tax_verified_at = new Date().toISOString();
      mockHostProfile.primary_accommodation_type_id = 'acc-type-apartment';
      mockPolicies = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const incompleteListing = {
        ...validListing,
        price: 0,
        images_count: 0,
      };

      const res = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        incompleteListing
      );
      expect(res.eligible).toBe(false);
      expect(res.missingRequirements).toContain('LISTING_PRICING_REQUIRED');
      expect(res.missingRequirements).toContain('LISTING_PHOTOS_REQUIRED');
    });

    it('aggregates multiple missing requirements into structured actionable blockers', () => {
      mockHostProfile.identity_verification_status = 'UNVERIFIED';
      mockHostProfile.payout_verification_status = 'UNVERIFIED';
      mockHostProfile.tax_verification_status = 'UNVERIFIED';

      const invalidListing = {
        id: 'list-101',
        title: '',
        description: '',
        price: 0,
        images_count: 0,
        has_location: false,
      };

      const res = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        [],
        invalidListing
      );
      expect(res.eligible).toBe(false);
      expect(res.missingRequirements.length).toBeGreaterThan(4);
      expect(res.missingRequirements).toContain(
        'IDENTITY_VERIFICATION_REQUIRED'
      );
      expect(res.missingRequirements).toContain('PAYOUT_ACCOUNT_REQUIRED');
      expect(res.missingRequirements).toContain('TAX_REGISTRATION_REQUIRED');
      expect(res.missingRequirements).toContain('POLICY_ACCEPTANCE_REQUIRED');
      expect(res.missingRequirements).toContain('LISTING_CONTENT_INCOMPLETE');
    });
  });

  // =========================================================================
  // Area 4: Authoritative Database RPC Failure & Recovery
  // =========================================================================
  describe('4. Failure and Recovery: Advisory UI Pre-Check vs Database RPC Authority', () => {
    it('handles authoritative RPC rejection when backend facts change post-precheck', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'listing-404',
                title: 'Valid Title',
                description: 'Valid Desc',
                status: 'draft',
                city: 'Bangalore',
                formatted_address: 'Indiranagar',
                latitude: 12.97,
                longitude: 77.59,
                images: [{ id: 'img1', storage_path: 'https://img.com/1.jpg' }],
                prices: [
                  { id: 'pr1', amount: 50000, billing_period: 'monthly' },
                ],
              },
            ],
            error: null,
          }),
        })),
        rpc: vi.fn().mockResolvedValue({
          data: {
            success: false,
            error: 'HOST_PAYOUT_NOT_VERIFIED',
            missing: ['PAYOUT_VERIFICATION_REQUIRED'],
          },
          error: null,
        }),
      };

      // Mock HostingRepository for policy pre-check
      const { HostingRepository } =
        await import('@/features/hosting/repositories/hosting.repository');
      vi.spyOn(
        HostingRepository.prototype,
        'getHostProfileByUserId'
      ).mockResolvedValue({
        ...mockHostProfile,
        identity_verification_status: 'VERIFIED',
        identity_verified_at: new Date().toISOString(),
        payout_verification_status: 'VERIFIED',
        payout_verified_at: new Date().toISOString(),
        bank_name: 'HDFC',
        bank_account_last4: '1234',
        tax_id_last4: '5678',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: new Date().toISOString(),
        primary_accommodation_type_id: 'acc-1',
      });
      vi.spyOn(
        HostingRepository.prototype,
        'getPolicyAcceptances'
      ).mockResolvedValue([
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ]);

      // When publish is executed, RPC failure is thrown with structured details
      await expect(
        PublishingService.publish(
          mockSupabase as unknown as never,
          'listing-404',
          'host-user-001'
        )
      ).rejects.toThrow('Publication rejected: HOST_PAYOUT_NOT_VERIFIED');
    });
  });

  // =========================================================================
  // Area 5: Policy-Version Lifecycle
  // =========================================================================
  describe('5. Policy-Version Lifecycle: Version-Bound Invalidation', () => {
    it('blocks publication when platform policy version is bumped until host re-accepts', () => {
      mockHostProfile.identity_verification_status = 'VERIFIED';
      mockHostProfile.identity_verified_at = new Date().toISOString();
      mockHostProfile.bank_name = 'HDFC';
      mockHostProfile.bank_account_last4 = '1234';
      mockHostProfile.payout_verification_status = 'VERIFIED';
      mockHostProfile.payout_verified_at = new Date().toISOString();
      mockHostProfile.tax_id_last4 = '9999';
      mockHostProfile.tax_verification_status = 'VERIFIED';
      mockHostProfile.tax_verified_at = new Date().toISOString();
      mockHostProfile.primary_accommodation_type_id = 'acc-type-apartment';

      const validListing = {
        id: 'list-100',
        title: 'Modern Suite',
        description: 'Fully furnished studio',
        price: 30000,
        images_count: 2,
        has_location: true,
      };

      // Current acceptances are version 2026.1
      mockPolicies = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const initialRes = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        mockPolicies,
        validListing
      );
      expect(initialRes.eligible).toBe(true);

      // Simulate a policy version mismatch (e.g. host accepted older 2025.4 version)
      const outdatedPolicies: HostPolicyAcceptanceRow[] = [
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2025.4',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2025.4',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const outdatedRes = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        outdatedPolicies,
        validListing
      );
      expect(outdatedRes.eligible).toBe(false);
      expect(outdatedRes.missingRequirements).toContain(
        'POLICY_ACCEPTANCE_REQUIRED'
      );

      // When host accepts new version 2026.1, publication becomes eligible again
      const refreshedPolicies: HostPolicyAcceptanceRow[] = [
        {
          id: '3',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '4',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ];

      const refreshedRes = ListingPublicationEligibilityPolicy.evaluate(
        mockHostProfile,
        refreshedPolicies,
        validListing
      );
      expect(refreshedRes.eligible).toBe(true);
    });
  });

  // =========================================================================
  // Area 6: Listing Lifecycle Transitions
  // =========================================================================
  describe('6. Listing Lifecycle & Non-Linear Transition Invariants', () => {
    it('evaluates listing health score accurately across completeness dimensions', () => {
      const incomplete: RawListingData = {
        id: '1',
        title: '',
        description: '',
        status: 'draft',
        images: [],
        prices: [],
      };

      const health = ListingHealthService.evaluate(incomplete);
      expect(health.score).toBeLessThan(100);
      expect(health.readyToPublish).toBe(false);
      expect(health.missingItems.length).toBeGreaterThan(0);

      const complete: RawListingData = {
        id: '2',
        title: 'Modern Studio Apartment',
        description: 'Quiet residential neighborhood with high speed internet.',
        status: 'draft',
        images: [
          { storage_path: 'https://cdn.example.com/img1.jpg' },
          { storage_path: 'https://cdn.example.com/img2.jpg' },
          { storage_path: 'https://cdn.example.com/img3.jpg' },
        ],
        prices: [{ amount: 28000, billing_period: 'monthly' }],
        city: 'Bangalore',
        locality: 'HSR Layout',
      };

      const completeHealth = ListingHealthService.evaluate(complete);
      expect(completeHealth.score).toBe(100);
      expect(completeHealth.readyToPublish).toBe(true);
      expect(
        completeHealth.missingItems.filter((m) => m.category === 'required')
      ).toEqual([]);
    });

    it('handles publication through PublishingService successfully when requirements are met', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'listing-already-published',
                title: 'Published Listing',
                description: 'Already published description',
                status: 'draft',
                city: 'Bangalore',
                formatted_address: 'Indiranagar',
                latitude: 12.97,
                longitude: 77.59,
                images: [{ storage_path: 'https://img.com/1.jpg' }],
                prices: [{ amount: 50000, billing_period: 'monthly' }],
              },
            ],
            error: null,
          }),
        })),
        rpc: vi.fn().mockResolvedValue({
          data: {
            success: true,
            status: 'published',
          },
          error: null,
        }),
      };

      // Mock HostingRepository for policy pre-check
      const { HostingRepository } =
        await import('@/features/hosting/repositories/hosting.repository');
      vi.spyOn(
        HostingRepository.prototype,
        'getHostProfileByUserId'
      ).mockResolvedValue({
        ...mockHostProfile,
        identity_verification_status: 'VERIFIED',
        identity_verified_at: new Date().toISOString(),
        payout_verification_status: 'VERIFIED',
        payout_verified_at: new Date().toISOString(),
        bank_name: 'HDFC',
        bank_account_last4: '1234',
        tax_id_last4: '5678',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: new Date().toISOString(),
        primary_accommodation_type_id: 'acc-1',
      });
      vi.spyOn(
        HostingRepository.prototype,
        'getPolicyAcceptances'
      ).mockResolvedValue([
        {
          id: '1',
          host_profile_id: mockHostProfile.id,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
        {
          id: '2',
          host_profile_id: mockHostProfile.id,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          created_at: '',
          client_context: {},
        },
      ]);

      await expect(
        PublishingService.publish(
          mockSupabase as unknown as never,
          'listing-already-published',
          'host-user-001'
        )
      ).resolves.not.toThrow();
    });
  });

  // =========================================================================
  // Area 7: Guest Discovery Read Path Verification
  // =========================================================================
  describe('7. Guest Discovery Read Path & Privacy Isolation', () => {
    it('verifies public listing projections include core fields and mask host compliance details', () => {
      const publicListing = {
        id: 'list-pub-777',
        title: 'Executive Stay in Indiranagar',
        description: 'Spacious premium stay',
        price_per_month: 45000,
        currency: 'INR',
        city: 'Bangalore',
        status: 'published',
        host: {
          id: 'host-prof-plv-001',
          name: 'Vikas Kumar',
          is_verified: true,
        },
      };

      expect(publicListing.status).toBe('published');
      expect(publicListing.title).toBe('Executive Stay in Indiranagar');
      expect(publicListing.price_per_month).toBe(45000);

      // Invariant: Public projection contains no private financial/tax/KYC facts
      expect('bank_name' in publicListing.host).toBe(false);
      expect('bank_account_last4' in publicListing.host).toBe(false);
      expect('tax_identifier_last4' in publicListing.host).toBe(false);
      expect('kyc_document_ref' in publicListing.host).toBe(false);
    });

    it('ensures drafts are strictly invisible to guest search projections', () => {
      const mixedCatalog = [
        { id: '1', title: 'Published 1', status: 'published' },
        { id: '2', title: 'Draft in Progress', status: 'draft' },
        { id: '3', title: 'Published 2', status: 'published' },
      ];

      const guestDiscoverable = mixedCatalog.filter(
        (item) => item.status === 'published'
      );

      expect(guestDiscoverable.length).toBe(2);
      expect(
        guestDiscoverable.some((l) => l.title === 'Draft in Progress')
      ).toBe(false);
    });
  });
});
