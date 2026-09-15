import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HostingService } from '@/features/hosting/services/hosting.service';
import { HostComplianceService } from '@/features/hosting/services/host-compliance.service';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';
import { ListingHealthService } from '@/features/host/publishing/services/listing-health.service';
import {
  IdentityStepSchema,
  SpecializationStepSchema,
  PolicyStepSchema,
  IdentityKycSubmissionSchema,
  PayoutAccountSchema,
  TaxRegistrationSchema,
} from '@/features/hosting/schemas/hosting.schemas';
import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
} from '@/features/hosting/types/hosting.types';
import { RawListingData } from '@/features/host/publishing/view-models/listing-publishing.viewmodel';

describe('Phase 4: Host Lifecycle End-to-End & Boundary Hardening', () => {
  const testUserId = 'usr_e2e_test_001';
  const testHostProfileId = 'hp_e2e_test_001';
  const testListingId = 'lst_e2e_test_001';
  const timestamp = '2026-09-15T12:00:00.000Z';

  let currentProfile: HostProfileRow;
  let policyAcceptances: HostPolicyAcceptanceRow[];

  beforeEach(() => {
    currentProfile = {
      id: testHostProfileId,
      user_id: testUserId,
      status: 'NOT_STARTED',
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
      created_at: timestamp,
      updated_at: timestamp,
    };
    policyAcceptances = [];
  });

  describe('1. Full Guest-to-Host Lifecycle Progression', () => {
    it('executes the complete 3-step onboarding flow to achieve READY status', async () => {
      const hostingService = new HostingService();

      vi.spyOn(
        hostingService['repository'],
        'getHostProfileByUserId'
      ).mockImplementation(async () => currentProfile);
      vi.spyOn(
        hostingService['repository'],
        'getPolicyAcceptances'
      ).mockImplementation(async () => policyAcceptances);
      vi.spyOn(
        hostingService['repository'],
        'getAccommodationTypeIdBySlug'
      ).mockResolvedValue('acc_type_pg_uuid');
      vi.spyOn(
        hostingService['repository'],
        'recordIdentitySubmission'
      ).mockImplementation(async () => {
        currentProfile.identity_submitted_at = timestamp;
      });
      vi.spyOn(
        hostingService['repository'],
        'setAccommodationSpecialization'
      ).mockImplementation(async (_userId, typeId) => {
        currentProfile.primary_accommodation_type_id = typeId;
      });
      vi.spyOn(
        hostingService['repository'],
        'recordPolicyAcceptance'
      ).mockImplementation(async (type, version) => {
        const acc: HostPolicyAcceptanceRow = {
          id: `acc_${type}`,
          host_profile_id: testHostProfileId,
          policy_type: type,
          policy_version: version,
          accepted_at: timestamp,
          client_context: {},
          created_at: timestamp,
        };
        policyAcceptances.push(acc);
        return acc.id;
      });
      vi.spyOn(
        hostingService['repository'],
        'transitionHostToReady'
      ).mockImplementation(async () => {
        if (
          currentProfile.identity_submitted_at &&
          currentProfile.primary_accommodation_type_id &&
          policyAcceptances.length >= 2
        ) {
          currentProfile.status = 'READY';
          return { success: true, status: 'READY' };
        }
        return { success: false, error: 'REQUIREMENTS_NOT_MET' };
      });

      vi.spyOn(
        hostingService['repository'],
        'getUserIdentityContext'
      ).mockResolvedValue({
        id: testUserId,
        email: 'jane@example.com',
        displayName: 'Jane Doe',
        fullName: 'Jane Doe',
        phone: '+919876543210',
        avatarStoragePath: null,
      });

      // Step 1: Identity Declaration
      const identityInput = IdentityStepSchema.parse({
        fullName: '  Jane Doe  ',
        phone: '  +91 98765 43210  ',
      });
      currentProfile.status = 'ONBOARDING';
      await hostingService.submitIdentityStep(
        testUserId,
        identityInput.fullName,
        identityInput.phone
      );
      expect(currentProfile.identity_submitted_at).toBe(timestamp);

      // Step 2: Specialization Selection
      const specInput = SpecializationStepSchema.parse({
        primaryAccommodationSlug: '  pg  ',
      });
      await hostingService.submitSpecializationStep(
        testUserId,
        specInput.primaryAccommodationSlug
      );
      expect(currentProfile.primary_accommodation_type_id).toBe(
        'acc_type_pg_uuid'
      );

      // Step 3: Mandatory Policies Acceptance
      PolicyStepSchema.parse({
        agreeAntiDiscrimination: true,
        agreeMaintenanceSla: true,
      });
      await hostingService.submitPoliciesStep(testUserId, {
        userAgent: 'TestBrowser/1.0',
        ipAddress: '198.51.100.1',
        submittedAt: timestamp,
      });

      // Confirm READY status
      const readyResult = await hostingService.confirmReadyToHost(testUserId);
      expect(readyResult.success).toBe(true);
      expect(currentProfile.status).toBe('READY');

      // Verify host is now permitted to enter workspace and create draft listings
      await expect(
        hostingService.requireReadyOrActiveHost(testUserId)
      ).resolves.not.toThrow();
    });
  });

  describe('2. Host Workspace Compliance & Verification Progression', () => {
    it('progresses KYC, Payout, and Tax submissions with strict state isolation from onboarding', async () => {
      const complianceService = new HostComplianceService();

      vi.spyOn(
        complianceService['repository'],
        'getHostProfileByUserId'
      ).mockImplementation(async () => currentProfile);
      vi.spyOn(
        complianceService['repository'],
        'getPolicyAcceptances'
      ).mockImplementation(async () => policyAcceptances);
      vi.spyOn(
        complianceService['repository'],
        'getAccommodationTypeInfoById'
      ).mockResolvedValue({
        slug: 'pg',
        name: 'Paying Guest (PG)',
      });

      vi.spyOn(
        complianceService['repository'],
        'recordIdentityKycSubmission'
      ).mockImplementation(async (_userId, docType, docNumber) => {
        currentProfile.identity_verification_status = 'PENDING';
        currentProfile.identity_verification_ref = `${docType}-${docNumber.slice(-4)}`;
      });
      vi.spyOn(
        complianceService['repository'],
        'recordPayoutInstrument'
      ).mockImplementation(async (_userId, bankName, accNumber) => {
        currentProfile.bank_name = bankName;
        currentProfile.bank_account_last4 = accNumber.slice(-4);
        currentProfile.payout_verification_status = 'PENDING';
      });
      vi.spyOn(
        complianceService['repository'],
        'recordTaxRegistration'
      ).mockImplementation(async (_userId, taxType, taxId) => {
        currentProfile.tax_id_type = taxType;
        currentProfile.tax_id_last4 = taxId.slice(-4);
        currentProfile.tax_verification_status = 'PENDING';
      });

      // Onboarding state was achieved
      currentProfile.status = 'READY';
      currentProfile.primary_accommodation_type_id = 'acc_type_pg_uuid';

      // 1. Submit KYC
      const kycInput = IdentityKycSubmissionSchema.parse({
        documentType: 'AADHAAR',
        documentNumber: '1234 5678 9012',
        legalFullName: 'Jane Doe',
      });
      await complianceService.submitIdentityKyc(
        testUserId,
        kycInput.documentType,
        kycInput.documentNumber,
        kycInput.legalFullName
      );

      // 2. Submit Payout
      const payoutInput = PayoutAccountSchema.parse({
        bankName: 'HDFC Bank',
        accountNumber: '987654321012',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Jane Doe',
      });
      await complianceService.savePayoutAccount(
        testUserId,
        payoutInput.bankName,
        payoutInput.accountNumber,
        payoutInput.ifscCode,
        payoutInput.accountHolderName
      );

      // 3. Submit Tax
      const taxInput = TaxRegistrationSchema.parse({
        taxIdType: 'PAN',
        taxId: 'AAAPB1234C',
      });
      await complianceService.saveTaxRegistration(
        testUserId,
        taxInput.taxIdType,
        taxInput.taxId
      );

      // Verify intermediate PENDING compliance projection
      const pendingSummary =
        await complianceService.getComplianceSummary(testUserId);
      expect(pendingSummary.identity.isVerified).toBe(false);
      expect(pendingSummary.payout.isVerified).toBe(false);
      expect(pendingSummary.tax.isVerified).toBe(false);
      expect(pendingSummary.payout.accountLast4).toBe('1012');
      expect(pendingSummary.tax.taxIdLast4).toBe('234C');

      // Attempting publication while pending MUST fail pre-check
      const preCheckPending =
        await complianceService.evaluatePublicationEligibility(testUserId, {
          id: testListingId,
          title: 'Luxury Studio Room in Koramangala',
          images_count: 5,
          price: 15000,
          has_location: true,
        });
      expect(preCheckPending.eligible).toBe(false);
      expect(preCheckPending.missingRequirements).toContain(
        'IDENTITY_VERIFICATION_REQUIRED'
      );
      expect(preCheckPending.missingRequirements).toContain(
        'PAYOUT_VERIFICATION_REQUIRED'
      );
      expect(preCheckPending.missingRequirements).toContain(
        'TAX_VERIFICATION_REQUIRED'
      );

      // Authoritative Verification Occurs (Simulating external KYC/Banking provider verification)
      currentProfile.identity_verification_status = 'VERIFIED';
      currentProfile.identity_verified_at = timestamp;
      currentProfile.payout_verification_status = 'VERIFIED';
      currentProfile.payout_verified_at = timestamp;
      currentProfile.tax_verification_status = 'VERIFIED';
      currentProfile.tax_verified_at = timestamp;

      // Ensure policies are recorded for complete publication readiness
      policyAcceptances = [
        {
          id: 'acc_1',
          host_profile_id: testHostProfileId,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: timestamp,
          client_context: {},
          created_at: timestamp,
        },
        {
          id: 'acc_2',
          host_profile_id: testHostProfileId,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: timestamp,
          client_context: {},
          created_at: timestamp,
        },
      ];

      // Now pre-check MUST pass
      const preCheckVerified =
        await complianceService.evaluatePublicationEligibility(testUserId, {
          id: testListingId,
          title: 'Luxury Studio Room in Koramangala',
          images_count: 5,
          price: 15000,
          has_location: true,
        });
      expect(preCheckVerified.eligible).toBe(true);
      expect(preCheckVerified.missingRequirements).toHaveLength(0);
    });
  });

  describe('3. Listing Health & Publication Gate Evaluation', () => {
    it('evaluates listing quality contributors accurately across sections', () => {
      const rawIncompleteListing: RawListingData = {
        id: testListingId,
        title: '',
        description: '',
        status: 'draft',
        city: null,
        locality: null,
        images: [],
        prices: [],
      };

      const healthIncomplete =
        ListingHealthService.evaluate(rawIncompleteListing);
      expect(healthIncomplete.readyToPublish).toBe(false);
      expect(healthIncomplete.score).toBeLessThan(50);
      expect(
        healthIncomplete.missingItems.some((m) => m.category === 'required')
      ).toBe(true);

      const rawCompleteListing: RawListingData = {
        id: testListingId,
        title: 'Premium PG with High Speed Wi-Fi & Food',
        description:
          'Spacious furnished PG room with daily housekeeping and attached bath.',
        status: 'draft',
        city: 'Bengaluru',
        locality: 'Koramangala 4th Block',
        images: [
          { id: 'img_1' },
          { id: 'img_2' },
          { id: 'img_3' },
        ] as unknown as RawListingData['images'],
        prices: [
          { id: 'pr_1', amount: 18000 },
        ] as unknown as RawListingData['prices'],
      };

      const healthComplete = ListingHealthService.evaluate(rawCompleteListing);
      expect(healthComplete.readyToPublish).toBe(true);
      expect(healthComplete.score).toBe(100);
      expect(
        healthComplete.missingItems.filter((m) => m.category === 'required')
      ).toHaveLength(0);
    });
  });

  describe('4. Transactional Publication Invariant & Host Activation', () => {
    it('enforces transactional publish_listing RPC boundary and promotes host to ACTIVE', async () => {
      // Configure verified host profile
      currentProfile.status = 'READY';
      currentProfile.primary_accommodation_type_id = 'acc_type_pg_uuid';
      currentProfile.bank_name = 'HDFC Bank';
      currentProfile.bank_account_last4 = '1234';
      currentProfile.tax_id_last4 = '5678';
      currentProfile.tax_id_type = 'PAN';
      currentProfile.identity_verification_status = 'VERIFIED';
      currentProfile.identity_verified_at = timestamp;
      currentProfile.payout_verification_status = 'VERIFIED';
      currentProfile.payout_verified_at = timestamp;
      currentProfile.tax_verification_status = 'VERIFIED';
      currentProfile.tax_verified_at = timestamp;

      policyAcceptances = [
        {
          id: 'acc_1',
          host_profile_id: testHostProfileId,
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: timestamp,
          client_context: {},
          created_at: timestamp,
        },
        {
          id: 'acc_2',
          host_profile_id: testHostProfileId,
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: timestamp,
          client_context: {},
          created_at: timestamp,
        },
      ];

      const mockListing: RawListingData = {
        id: testListingId,
        title: 'Elite Residency Suites',
        description:
          'Luxury corporate accommodation with all amenities included.',
        status: 'draft',
        city: 'Hyderabad',
        locality: 'Gachibowli',
        latitude: 17.44,
        longitude: 78.34,
        images: [
          { id: 'i1' },
          { id: 'i2' },
          { id: 'i3' },
        ] as unknown as RawListingData['images'],
        prices: [
          { id: 'p1', amount: 25000 },
        ] as unknown as RawListingData['prices'],
      };

      let rpcInvocations = 0;
      let listingPublished = false;

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'listings') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              then: (resolve: (val: unknown) => void) =>
                resolve({ data: [mockListing], error: null }),
            };
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: (resolve: (val: unknown) => void) =>
              resolve({ data: [], error: null }),
          };
        }),
        rpc: vi
          .fn()
          .mockImplementation(
            async (name: string, params: { p_listing_id: string }) => {
              if (name === 'publish_listing') {
                rpcInvocations++;
                if (params.p_listing_id === testListingId) {
                  listingPublished = true;
                  currentProfile.status = 'ACTIVE';
                  mockListing.status = 'published';
                  return {
                    data: { success: true, status: 'published' },
                    error: null,
                  };
                }
              }
              return {
                data: { success: false, error: 'UNKNOWN_RPC' },
                error: null,
              };
            }
          ),
      };

      // Mock HostRepository.getListings
      const { HostRepository } =
        await import('@/features/host/repositories/host.repository');
      vi.spyOn(HostRepository, 'getListings').mockResolvedValue([
        mockListing as unknown as never,
      ]);

      // Mock HostingRepository for policy evaluation
      const { HostingRepository } =
        await import('@/features/hosting/repositories/hosting.repository');
      vi.spyOn(
        HostingRepository.prototype,
        'getHostProfileByUserId'
      ).mockResolvedValue(currentProfile);
      vi.spyOn(
        HostingRepository.prototype,
        'getPolicyAcceptances'
      ).mockResolvedValue(policyAcceptances);

      // Execute Publish
      await PublishingService.publish(
        mockSupabase as unknown as never,
        testListingId,
        testUserId
      );

      // Verify transactional invariant
      expect(rpcInvocations).toBe(1);
      expect(listingPublished).toBe(true);
      expect(currentProfile.status).toBe('ACTIVE');
      expect(mockListing.status).toBe('published');
    });

    it('rejects publication when host profile has unverified compliance items', async () => {
      // Configure unverified host profile
      currentProfile.status = 'READY';
      currentProfile.identity_verification_status = 'UNVERIFIED'; // Incomplete

      const mockListing: RawListingData = {
        id: testListingId,
        title: 'Elite Residency Suites',
        description: 'Luxury corporate accommodation.',
        status: 'draft',
        city: 'Hyderabad',
        locality: 'Gachibowli',
        images: [{ id: 'i1' }] as unknown as RawListingData['images'],
        prices: [
          { id: 'p1', amount: 25000 },
        ] as unknown as RawListingData['prices'],
      };

      const mockSupabase = {
        rpc: vi.fn(),
      };

      const { HostRepository } =
        await import('@/features/host/repositories/host.repository');
      vi.spyOn(HostRepository, 'getListings').mockResolvedValue([
        mockListing as unknown as never,
      ]);

      const { HostingRepository } =
        await import('@/features/hosting/repositories/hosting.repository');
      vi.spyOn(
        HostingRepository.prototype,
        'getHostProfileByUserId'
      ).mockResolvedValue(currentProfile);
      vi.spyOn(
        HostingRepository.prototype,
        'getPolicyAcceptances'
      ).mockResolvedValue([]);

      await expect(
        PublishingService.publish(
          mockSupabase as unknown as never,
          testListingId,
          testUserId
        )
      ).rejects.toThrow(
        /Cannot publish listing: missing mandatory requirements/
      );

      // Verify RPC was NOT called when pre-check fails
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe('5. Data Protection & Sensitive Identifier Masking', () => {
    it('ensures sensitive financial and document identifiers are strictly masked in projections', async () => {
      const complianceService = new HostComplianceService();
      vi.spyOn(
        complianceService['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue({
        ...currentProfile,
        bank_name: 'State Bank of India',
        bank_account_last4: '9876',
        tax_id_last4: '345F',
        tax_id_type: 'PAN',
        identity_verification_ref: 'AADHAAR-5678',
      });
      vi.spyOn(
        complianceService['repository'],
        'getPolicyAcceptances'
      ).mockResolvedValue([]);
      vi.spyOn(
        complianceService['repository'],
        'getAccommodationTypeInfoById'
      ).mockResolvedValue({
        slug: 'pg',
        name: 'PG',
      });

      const summary = await complianceService.getComplianceSummary(testUserId);

      // Ensure no raw account numbers or full IDs are exposed
      expect(summary.payout.accountLast4).toBe('9876');
      expect(summary.tax.taxIdLast4).toBe('345F');
      expect(summary.identity.reference).toBe('AADHAAR-5678');
      expect(JSON.stringify(summary)).not.toContain('123456789012');
      expect(JSON.stringify(summary)).not.toContain('ABCDE1234F');
    });
  });
});
