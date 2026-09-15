import { describe, it, expect, vi } from 'vitest';
import {
  isValidSafeDestination,
  safeDestinationSchema,
  mfaVerifySchema,
} from '@/features/auth/schemas/auth-schemas';
import {
  assertAal2IfEnrolled,
  UnauthorizedAalError,
} from '@/lib/auth/mfa-guards';
import { type SupabaseClient } from '@supabase/supabase-js';

describe('MFA v2 & Auth Security Specification', () => {
  describe('1. Destination Sanitizer (Strict Rejection)', () => {
    it('accepts valid internal same-origin relative paths', () => {
      expect(isValidSafeDestination('/')).toBe(true);
      expect(isValidSafeDestination('/users/profile')).toBe(true);
      expect(isValidSafeDestination('/s?city=Bengaluru&bedrooms=2')).toBe(true);
      expect(isValidSafeDestination('/host/dashboard')).toBe(true);
      expect(isValidSafeDestination('/resident/leases/123')).toBe(true);
    });

    it('allows undefined or empty string', () => {
      expect(safeDestinationSchema.parse(undefined)).toBeUndefined();
      expect(safeDestinationSchema.parse('')).toBe('');
    });

    it('strictly rejects external full URLs with http/https', () => {
      expect(isValidSafeDestination('https://attacker.com')).toBe(false);
      expect(isValidSafeDestination('http://attacker.com/login')).toBe(false);
      expect(isValidSafeDestination('https://eltestay-fake.com')).toBe(false);

      expect(() =>
        safeDestinationSchema.parse('https://evil.com')
      ).toThrowError(/Invalid redirect destination/);
    });

    it('strictly rejects protocol-relative and backslash obfuscation vectors', () => {
      expect(isValidSafeDestination('//attacker.com')).toBe(false);
      expect(isValidSafeDestination('//attacker.com/test')).toBe(false);
      expect(isValidSafeDestination('/\\attacker.com')).toBe(false);
      expect(isValidSafeDestination('\\attacker.com')).toBe(false);
      expect(isValidSafeDestination('/users/profile\\evil')).toBe(false);
      expect(isValidSafeDestination('/%2f%2fattacker.com')).toBe(false);
    });

    it('strictly rejects javascript, data, and arbitrary scheme vectors', () => {
      expect(isValidSafeDestination('javascript:alert(1)')).toBe(false);
      expect(isValidSafeDestination('javascript://alert(1)')).toBe(false);
      expect(isValidSafeDestination('data:text/html;base64,PHNjcmlwdD4=')).toBe(
        false
      );
      expect(isValidSafeDestination('vbscript:msgbox')).toBe(false);
    });

    it('strictly rejects control characters, newlines, and carriage returns', () => {
      expect(isValidSafeDestination('/test\r\nSet-Cookie: evil')).toBe(false);
      expect(isValidSafeDestination('/test\0nullbyte')).toBe(false);
    });
  });

  describe('2. Factor Verification Schema Validation', () => {
    it('accepts valid 6-digit TOTP code and valid UUID factorId', () => {
      const payload = {
        factorId: 'e8b83592-888e-49b8-a664-d3625f385c96',
        code: '123456',
        destination: '/users/settings',
      };
      const result = mfaVerifySchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects codes that are not exactly 6 digits or contain characters', () => {
      expect(
        mfaVerifySchema.safeParse({
          factorId: 'e8b83592-888e-49b8-a664-d3625f385c96',
          code: '12345',
        }).success
      ).toBe(false);

      expect(
        mfaVerifySchema.safeParse({
          factorId: 'e8b83592-888e-49b8-a664-d3625f385c96',
          code: '1234567',
        }).success
      ).toBe(false);

      expect(
        mfaVerifySchema.safeParse({
          factorId: 'e8b83592-888e-49b8-a664-d3625f385c96',
          code: '12345a',
        }).success
      ).toBe(false);
    });

    it('rejects invalid factorId format', () => {
      expect(
        mfaVerifySchema.safeParse({
          factorId: 'invalid-factor-id',
          code: '123456',
        }).success
      ).toBe(false);
    });
  });

  describe('3. Backend AAL2 Guard Enforcement (assertAal2IfEnrolled)', () => {
    it('allows access for users without MFA (currentLevel = aal1, nextLevel = aal1)', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'usr-123' } },
            error: null,
          }),
          mfa: {
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: { currentLevel: 'aal1', nextLevel: 'aal1' },
              error: null,
            }),
          },
        },
      } as unknown as SupabaseClient;

      const result = await assertAal2IfEnrolled(mockSupabase);
      expect(result.userId).toBe('usr-123');
      expect(result.currentLevel).toBe('aal1');
    });

    it('denies access and throws UnauthorizedAalError when MFA is enrolled but session is only aal1', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'usr-456' } },
            error: null,
          }),
          mfa: {
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: { currentLevel: 'aal1', nextLevel: 'aal2' },
              error: null,
            }),
          },
        },
      } as unknown as SupabaseClient;

      await expect(assertAal2IfEnrolled(mockSupabase)).rejects.toThrow(
        UnauthorizedAalError
      );
    });

    it('allows access when user has elevated to aal2', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'usr-789' } },
            error: null,
          }),
          mfa: {
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: { currentLevel: 'aal2', nextLevel: 'aal2' },
              error: null,
            }),
          },
        },
      } as unknown as SupabaseClient;

      const result = await assertAal2IfEnrolled(mockSupabase);
      expect(result.userId).toBe('usr-789');
      expect(result.currentLevel).toBe('aal2');
    });
  });
});
