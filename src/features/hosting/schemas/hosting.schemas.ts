import { z } from 'zod';

/**
 * Zod validation schemas for Hosting Bounded Context server actions and user inputs.
 * Enforces strict input validation, whitespace normalization, and literal agreement validation.
 */

// Custom preprocessor to coerce checkbox form inputs ('on', 'true', true) into strict boolean true
const strictCheckboxTrue = z.preprocess(
  (val) => val === 'on' || val === 'true' || val === true || val === '1',
  z.boolean().refine((v) => v === true, {
    message: 'You must formally accept this policy requirement.',
  })
);

/**
 * Step 1: Identity & Contact Schema
 */
export const IdentityStepSchema = z
  .object({
    fullName: z
      .string({ message: 'Full legal name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    phone: z
      .string({ message: 'Phone number is required' })
      .trim()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .regex(
        /^\+?[0-9\s\-()]+$/,
        'Phone number format is invalid. Use international format (e.g. +91 98765 43210)'
      ),
  })
  .strict();

export type IdentityStepInput = z.infer<typeof IdentityStepSchema>;

/**
 * Step 2: Accommodation Specialization Selection Schema
 */
export const SpecializationStepSchema = z
  .object({
    primaryAccommodationSlug: z
      .string({ message: 'Primary accommodation specialization is required' })
      .trim()
      .min(1, 'Please select an accommodation specialization'),
  })
  .strict();

export type SpecializationStepInput = z.infer<typeof SpecializationStepSchema>;

/**
 * Host Workspace Compliance: Payout Setup Schema
 */
export const PayoutAccountSchema = z
  .object({
    bankName: z
      .string({ message: 'Bank name is required' })
      .trim()
      .min(2, 'Bank name must be at least 2 characters')
      .max(100, 'Bank name cannot exceed 100 characters'),
    accountNumber: z
      .string({ message: 'Bank account number is required' })
      .trim()
      .min(4, 'Account number must be at least 4 digits')
      .max(34, 'Account number cannot exceed 34 characters')
      .regex(
        /^[A-Za-z0-9]+$/,
        'Account number must contain only alphanumeric characters'
      ),
  })
  .strict();

export type PayoutAccountInput = z.infer<typeof PayoutAccountSchema>;

/**
 * Host Workspace Compliance: Tax Registration Schema
 */
export const TaxRegistrationSchema = z
  .object({
    taxId: z
      .string({ message: 'Tax identification number is required' })
      .trim()
      .min(4, 'Tax ID must be at least 4 characters')
      .max(50, 'Tax ID cannot exceed 50 characters'),
  })
  .strict();

export type TaxRegistrationInput = z.infer<typeof TaxRegistrationSchema>;

/**
 * Obsolete Step 2 / Backwards compatibility: BankStepSchema
 */
export const BankStepSchema = PayoutAccountSchema;
export type BankStepInput = PayoutAccountInput;

/**
 * Step 4: Mandatory Trust & SLA Agreements Schema
 */
export const PolicyStepSchema = z
  .object({
    agreeAntiDiscrimination: strictCheckboxTrue,
    agreeMaintenanceSla: strictCheckboxTrue,
  })
  .strict();

export type PolicyStepInput = z.infer<typeof PolicyStepSchema>;

/**
 * Permanent Host Profile Settings Schema (/host/profile)
 */
export const HostProfileSettingsSchema = z
  .object({
    primaryAccommodationSlug: z.string().trim().optional().or(z.literal('')),
    supportPhone: z
      .string()
      .trim()
      .max(20, 'Support phone cannot exceed 20 characters')
      .regex(/^$|^\+?[0-9\s\-()]+$/, 'Support phone number format is invalid')
      .optional()
      .or(z.literal('')),
    supportEmail: z
      .string()
      .trim()
      .email('Support email must be a valid email address')
      .max(150, 'Support email cannot exceed 150 characters')
      .optional()
      .or(z.literal('')),
    bankName: z
      .string()
      .trim()
      .max(100, 'Bank name cannot exceed 100 characters')
      .optional()
      .or(z.literal('')),
    accountLast4: z
      .string()
      .trim()
      .max(34, 'Account reference cannot exceed 34 characters')
      .optional()
      .or(z.literal('')),
  })
  .strict();

export type HostProfileSettingsInput = z.infer<
  typeof HostProfileSettingsSchema
>;

/**
 * Operational Status Toggle Schema (ACTIVE <-> PAUSED)
 */
export const OperationalStatusToggleSchema = z.enum(['ACTIVE', 'PAUSED'], {
  message: 'Invalid status. Permitted values are ACTIVE or PAUSED.',
});

export type OperationalStatusToggleInput = z.infer<
  typeof OperationalStatusToggleSchema
>;
