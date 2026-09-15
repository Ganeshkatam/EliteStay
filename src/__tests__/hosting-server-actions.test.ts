import { describe, it, expect, vi } from 'vitest';
import {
  IdentityStepSchema,
  BankStepSchema,
  PolicyStepSchema,
  HostProfileSettingsSchema,
  OperationalStatusToggleSchema,
} from '../features/hosting/schemas/hosting.schemas';
import { HostingService } from '../features/hosting/services/hosting.service';
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

    describe('BankStepSchema', () => {
      it('accepts valid bank name and account number', () => {
        const input = {
          bankName: '  State Bank of India  ',
          accountNumber: '  123456789012  ',
        };
        const parsed = BankStepSchema.parse(input);
        expect(parsed.bankName).toBe('State Bank of India');
        expect(parsed.accountNumber).toBe('123456789012');
      });

      it('rejects accounts with special characters or invalid length', () => {
        expect(() =>
          BankStepSchema.parse({
            bankName: 'HDFC',
            accountNumber: '12', // Too short (<4)
          })
        ).toThrow();

        expect(() =>
          BankStepSchema.parse({
            bankName: 'HDFC',
            accountNumber: '1234-5678-9012', // Disallowed hyphens
          })
        ).toThrow();
      });

      it('rejects unknown/extra fields', () => {
        expect(() =>
          BankStepSchema.parse({
            bankName: 'HDFC',
            accountNumber: '123456789',
            payout_verification_status: 'VERIFIED', // Forged field
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

  describe('2. HostingService Out-Of-Order Gating & Audit Context', () => {
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

    it('rejects submitBankStep if identity step has not been submitted', async () => {
      const service = new HostingService();
      // Mock repository to return profile with no identity submitted
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue(createProfile({ identity_submitted_at: null }));
      vi.spyOn(service['repository'], 'getPolicyAcceptances').mockResolvedValue(
        []
      );

      await expect(
        service.submitBankStep('usr_test', 'HDFC Bank', '123456789')
      ).rejects.toThrow(
        'Cannot submit payout details: Identity verification step must be completed first.'
      );
    });

    it('rejects submitPoliciesStep if bank and specialization prerequisites are missing', async () => {
      const service = new HostingService();
      vi.spyOn(
        service['repository'],
        'getHostProfileByUserId'
      ).mockResolvedValue(
        createProfile({
          identity_submitted_at: dummyDate,
          bank_name: null,
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
        'Cannot submit policy agreements: Prior onboarding prerequisites (Identity & Bank Setup) must be completed first.'
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
          bank_name: 'HDFC Bank',
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
        identity_verification_status: 'VERIFIED',
        identity_verification_ref: null,
        identity_verified_at: null,
        payout_verification_status: 'VERIFIED',
        payout_verified_at: null,
        tax_verification_status: 'VERIFIED',
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
});
