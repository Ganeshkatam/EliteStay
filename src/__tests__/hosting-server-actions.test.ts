import { describe, it, expect, vi } from 'vitest';
import {
  IdentityStepSchema,
  SpecializationStepSchema,
  PolicyStepSchema,
  IdentityKycSubmissionSchema,
  PayoutAccountSchema,
  TaxRegistrationSchema,
  HostProfileSettingsSchema,
  OperationalStatusToggleSchema,
} from '../features/hosting/schemas/hosting.schemas';
import { HostingService } from '../features/hosting/services/hosting.service';
import { HostComplianceService } from '../features/hosting/services/host-compliance.service';
import { HostProfileRow } from '../features/hosting/types/hosting.types';

describe('Hosting Server Action & Schema Boundary Hardening', () => {
  describe('1. Zod Validation Schemas', () => {
    describe('IdentityStepSchema', () => {
      it('accepts valid name and phone with whitespace normalization', () => {
        const input = {
          fullName: '  Jane Doe  ',
          phone: '  +91 98765 43210  ',
        };
        const parsed = IdentityStepSchema.parse(input);
        expect(parsed.fullName).toBe('Jane Doe');
        expect(parsed.phone).toBe('+91 98765 43210');
      });

      it('rejects short names or empty fields', () => {
        expect(() =>
          IdentityStepSchema.parse({ fullName: 'A', phone: '+919876543210' })
        ).toThrow();
        expect(() =>
          IdentityStepSchema.parse({ fullName: '', phone: '+919876543210' })
        ).toThrow();
      });

      it('rejects invalid phone format', () => {
        expect(() =>
          IdentityStepSchema.parse({
            fullName: 'Jane Doe',
            phone: 'abc-not-a-phone',
          })
        ).toThrow();
      });

      it('rejects unknown/extra fields', () => {
        expect(() =>
          IdentityStepSchema.parse({
            fullName: 'Jane Doe',
            phone: '+919876543210',
            status: 'READY', // Forged field
          })
        ).toThrow();
      });
    });

    describe('SpecializationStepSchema', () => {
      it('accepts valid accommodation specialization slug', () => {
        const parsed = SpecializationStepSchema.parse({
          primaryAccommodationSlug: '  pg  ',
        });
        expect(parsed.primaryAccommodationSlug).toBe('pg');
      });

      it('rejects empty specialization slug', () => {
        expect(() =>
          SpecializationStepSchema.parse({
            primaryAccommodationSlug: '',
          })
        ).toThrow();
      });

      it('rejects unknown/extra fields', () => {
        expect(() =>
          SpecializationStepSchema.parse({
            primaryAccommodationSlug: 'hostel',
            status: 'ACTIVE',
          })
        ).toThrow();
      });
    });

    describe('IdentityKycSubmissionSchema', () => {
      it('accepts valid KYC submission details with whitespace normalization', () => {
        const input = {
          documentType: 'AADHAAR',
          documentNumber: '  1234 5678 9012  ',
          legalFullName: '  Jane Doe  ',
        };
        const parsed = IdentityKycSubmissionSchema.parse(input);
        expect(parsed.documentType).toBe('AADHAAR');
        expect(parsed.documentNumber).toBe('1234 5678 9012');
        expect(parsed.legalFullName).toBe('Jane Doe');
      });

      it('accepts other valid document types (PASSPORT, VOTER_ID, DRIVING_LICENSE)', () => {
        expect(
          IdentityKycSubmissionSchema.parse({
            documentType: 'PASSPORT',
            documentNumber: 'A1234567',
            legalFullName: 'Jane Doe',
          }).documentType
        ).toBe('PASSPORT');

        expect(
          IdentityKycSubmissionSchema.parse({
            documentType: 'VOTER_ID',
            documentNumber: 'VOT123456',
            legalFullName: 'Jane Doe',
          }).documentType
        ).toBe('VOTER_ID');

        expect(
          IdentityKycSubmissionSchema.parse({
            documentType: 'DRIVING_LICENSE',
            documentNumber: 'DL-12345-2026',
            legalFullName: 'Jane Doe',
          }).documentType
        ).toBe('DRIVING_LICENSE');
      });

      it('rejects invalid document types or special character injection', () => {
        expect(() =>
          IdentityKycSubmissionSchema.parse({
            documentType: 'INVALID_DOC',
            documentNumber: '12345678',
            legalFullName: 'Jane Doe',
          })
        ).toThrow();

        expect(() =>
          IdentityKycSubmissionSchema.parse({
            documentType: 'AADHAAR',
            documentNumber: '1234<script>',
            legalFullName: 'Jane Doe',
          })
        ).toThrow();
      });

      it('rejects unknown/extra fields', () => {
        expect(() =>
          IdentityKycSubmissionSchema.parse({
            documentType: 'AADHAAR',
            documentNumber: '1234 5678 9012',
            legalFullName: 'Jane Doe',
            identity_verification_status: 'VERIFIED', // Escalation attempt
          })
        ).toThrow();
      });
    });

    describe('PayoutAccountSchema', () => {
      it('accepts valid bank name and account number', () => {
        const input = {
          bankName: '  State Bank of India  ',
          accountNumber: '  123456789012  ',
        };
        const parsed = PayoutAccountSchema.parse(input);
        expect(parsed.bankName).toBe('State Bank of India');
        expect(parsed.accountNumber).toBe('123456789012');
      });

      it('accepts optional IFSC code and account holder name', () => {
        const input = {
          bankName: 'HDFC Bank',
          accountNumber: '123456789012',
          ifscCode: '  HDFC0001234  ',
          accountHolderName: '  Jane Doe  ',
        };
        const parsed = PayoutAccountSchema.parse(input);
        expect(parsed.ifscCode).toBe('HDFC0001234');
        expect(parsed.accountHolderName).toBe('Jane Doe');
      });

      it('rejects accounts with special characters or invalid length', () => {
        expect(() =>
          PayoutAccountSchema.parse({
            bankName: 'HDFC',
            accountNumber: '12', // Too short (<4)
          })
        ).toThrow();

        expect(() =>
          PayoutAccountSchema.parse({
            bankName: 'HDFC',
            accountNumber: '1234-5678-9012', // Disallowed hyphens
          })
        ).toThrow();
      });
    });

    describe('TaxRegistrationSchema', () => {
      it('accepts valid tax ID with default PAN type', () => {
        const parsed = TaxRegistrationSchema.parse({
          taxId: '  AAAPB1234C  ',
        });
        expect(parsed.taxId).toBe('AAAPB1234C');
        expect(parsed.taxIdType).toBe('PAN');
      });

      it('accepts GSTIN tax ID type', () => {
        const parsed = TaxRegistrationSchema.parse({
          taxIdType: 'GSTIN',
          taxId: '22AAAAA0000A1Z5',
        });
        expect(parsed.taxIdType).toBe('GSTIN');
        expect(parsed.taxId).toBe('22AAAAA0000A1Z5');
      });

      it('rejects invalid tax ID type', () => {
        expect(() =>
          TaxRegistrationSchema.parse({
            taxIdType: 'INVALID_TAX',
            taxId: 'AAAPB1234C',
          })
        ).toThrow();
      });

      it('rejects short tax IDs', () => {
        expect(() =>
          TaxRegistrationSchema.parse({
            taxId: '12',
          })
        ).toThrow();
      });
    });

    describe('PolicyStepSchema', () => {
      it('accepts valid checked agreements (string "on", "true", boolean true)', () => {
        const parsed1 = PolicyStepSchema.parse({
          agreeAntiDiscrimination: 'on',
          agreeMaintenanceSla: 'on',
        });
        expect(parsed1.agreeAntiDiscrimination).toBe(true);
        expect(parsed1.agreeMaintenanceSla).toBe(true);

        const parsed2 = PolicyStepSchema.parse({
          agreeAntiDiscrimination: true,
          agreeMaintenanceSla: 'true',
        });
        expect(parsed2.agreeAntiDiscrimination).toBe(true);
        expect(parsed2.agreeMaintenanceSla).toBe(true);
      });

      it('rejects missing or unaccepted checkboxes', () => {
        expect(() =>
          PolicyStepSchema.parse({
            agreeAntiDiscrimination: 'on',
            agreeMaintenanceSla: false,
          })
        ).toThrow('You must formally accept this policy requirement.');

        expect(() =>
          PolicyStepSchema.parse({
            agreeAntiDiscrimination: undefined,
            agreeMaintenanceSla: 'on',
          })
        ).toThrow('You must formally accept this policy requirement.');

        expect(() =>
          PolicyStepSchema.parse({
            agreeAntiDiscrimination: 'off',
            agreeMaintenanceSla: '0',
          })
        ).toThrow('You must formally accept this policy requirement.');
      });
    });

    describe('OperationalStatusToggleSchema', () => {
      it('accepts only ACTIVE or PAUSED', () => {
        expect(OperationalStatusToggleSchema.parse('ACTIVE')).toBe('ACTIVE');
        expect(OperationalStatusToggleSchema.parse('PAUSED')).toBe('PAUSED');
      });

      it('rejects privilege escalation attempts like READY, ONBOARDING, SUSPENDED', () => {
        expect(() => OperationalStatusToggleSchema.parse('READY')).toThrow();
        expect(() =>
          OperationalStatusToggleSchema.parse('ONBOARDING')
        ).toThrow();
        expect(() =>
          OperationalStatusToggleSchema.parse('SUSPENDED')
        ).toThrow();
      });
    });

    describe('HostProfileSettingsSchema', () => {
      it('validates support email and phone formats', () => {
        const parsed = HostProfileSettingsSchema.parse({
          supportEmail: 'support@example.com',
          supportPhone: '+91 99999 88888',
          primaryAccommodationSlug: 'pg',
        });
        expect(parsed.supportEmail).toBe('support@example.com');
        expect(parsed.supportPhone).toBe('+91 99999 88888');
      });

      it('rejects invalid email formats', () => {
        expect(() =>
          HostProfileSettingsSchema.parse({
            supportEmail: 'not-an-email',
          })
        ).toThrow();
      });
    });
  });

  describe('2. HostingService 3-Step Out-Of-Order Gating & Audit Context', () => {
    const dummyDate = '2026-09-15T12:00:00.000Z';

    const createProfile = (
      overrides: Partial<HostProfileRow> = {}
    ): HostProfileRow => ({
      id: 'hp_test',
      user_id: 'usr_test',
      status: 'ONBOARDING',
      primary_accommodation_type_id: null,
      bank_account_id: null,
      bank_name: null,
      bank_account_last4: null,
      tax_profile_id: null,
      tax_id_last4: null,
      tax_id_type: 'PAN',
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
      created_at: dummyDate,
      updated_at: dummyDate,
      ...overrides,
    });

    it('rejects submitSpecializationStep if identity step has not been submitted', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue(createProfile({ identity_submitted_at: null }));
      vi.spyOn(service['repository'], 'getPolicyAcceptances').mockResolvedValue(
        []
      );

      await expect(
        service.submitSpecializationStep('usr_test', 'pg')
      ).rejects.toThrow(
        'Cannot select specialization: Identity profile declaration must be completed first.'
      );
    });

    it('rejects submitPoliciesStep if identity or specialization prerequisites are missing', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue(
        createProfile({
          identity_submitted_at: dummyDate,
          primary_accommodation_type_id: null,
        })
      );
      vi.spyOn(service['repository'], 'getPolicyAcceptances').mockResolvedValue(
        []
      );

      await expect(
        service.submitPoliciesStep('usr_test', {
          userAgent: 'TestBrowser',
          ipAddress: '127.0.0.1',
        })
      ).rejects.toThrow(
        'Cannot submit policy agreements: Prior onboarding prerequisites (Identity & Specialization) must be completed first.'
      );
    });

    it('propagates typed AuditContext to repository without importing Next.js headers in domain service', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue(
        createProfile({
          identity_submitted_at: dummyDate,
          primary_accommodation_type_id: 'acc_type_pg',
        })
      );
      vi.spyOn(service['repository'], 'getPolicyAcceptances').mockResolvedValue(
        []
      );

      const recordSpy = vi
        .spyOn(service['repository'], 'recordPolicyAcceptance')
        .mockResolvedValue('acc_id');

      await service.submitPoliciesStep('usr_test', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        ipAddress: '203.0.113.195',
        submittedAt: dummyDate,
      });

      expect(recordSpy).toHaveBeenCalledTimes(2);
      expect(recordSpy).toHaveBeenNthCalledWith(
        1,
        'ANTI_DISCRIMINATION',
        '2026.1',
        expect.objectContaining({
          source: 'onboarding_step_4',
          request: {
            user_agent: 'Mozilla/5.0 (Windows NT 10.0)',
            x_forwarded_for: '203.0.113.195',
          },
        })
      );
    });
  });

  describe('3. First Listing Creation Authorization Guard', () => {
    it('blocks launchFirstListing if host status is ONBOARDING or NOT_STARTED', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue({
        id: 'hp_1',
        user_id: 'usr_1',
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
        created_at: '',
        updated_at: '',
      });

      await expect(service.requireReadyOrActiveHost('usr_1')).rejects.toThrow(
        'Host capability required: Host must achieve READY or ACTIVE status before creating listings.'
      );
    });

    it('permits launchFirstListing when host status is READY or ACTIVE', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue({
        id: 'hp_1',
        user_id: 'usr_1',
        status: 'READY',
        primary_accommodation_type_id: 'acc_1',
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
        created_at: '',
        updated_at: '',
      });

      await expect(
        service.requireReadyOrActiveHost('usr_1')
      ).resolves.not.toThrow();
    });
  });

  describe('4. HostComplianceService Workspace Projections & Masking', () => {
    it('returns structured summary projection with masked identifiers', async () => {
      const complianceService = new HostComplianceService();
      vi.spyOn(
        complianceService['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue({
        id: 'hp_comp',
        user_id: 'usr_comp',
        status: 'READY',
        primary_accommodation_type_id: 'acc_pg',
        bank_account_id: null,
        bank_name: 'HDFC Bank',
        bank_account_last4: '1234',
        tax_profile_id: null,
        tax_id_last4: '5678',
        tax_id_type: 'PAN',
        identity_submitted_at: '2026-09-15T10:00:00Z',
        identity_verification_status: 'VERIFIED',
        identity_verification_ref: 'AADHAAR-9012',
        identity_verified_at: '2026-09-15T11:00:00Z',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: '2026-09-15T11:00:00Z',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: '2026-09-15T11:00:00Z',
        agreed_to_policies_at: '2026-09-15T10:00:00Z',
        support_phone: null,
        support_email: null,
        created_at: '',
        updated_at: '',
      });

      vi.spyOn(
        complianceService['repository'],
        'getPolicyAcceptances'
      ).mockResolvedValue([
        {
          id: 'acc_1',
          host_profile_id: 'hp_comp',
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '2026-09-15T10:00:00Z',
          client_context: {},
          created_at: '',
        },
        {
          id: 'acc_2',
          host_profile_id: 'hp_comp',
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '2026-09-15T10:00:00Z',
          client_context: {},
          created_at: '',
        },
      ]);

      vi.spyOn(
        complianceService['repository'],
        'getAccommodationTypeInfoById'
      ).mockResolvedValue({
        slug: 'pg',
        name: 'Paying Guest (PG)',
      });

      const summary = await complianceService.getComplianceSummary('usr_comp');

      expect(summary.userId).toBe('usr_comp');
      expect(summary.status).toBe('READY');
      expect(summary.identity.isVerified).toBe(true);
      expect(summary.identity.reference).toBe('AADHAAR-9012');
      expect(summary.payout.isVerified).toBe(true);
      expect(summary.payout.bankName).toBe('HDFC Bank');
      expect(summary.payout.accountLast4).toBe('1234');
      expect(summary.tax.isVerified).toBe(true);
      expect(summary.tax.taxIdLast4).toBe('5678');
      expect(summary.specialization.name).toBe('Paying Guest (PG)');
      expect(summary.policies.areAllCurrent).toBe(true);
    });
  });
});
