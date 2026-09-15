import { z } from 'zod';

/**
 * Validates that a destination URL is strictly a safe, same-origin relative path.
 * Explicitly rejects external, protocol-relative, javascript, or malformed paths.
 */
export function isValidSafeDestination(destination: unknown): boolean {
  if (destination === undefined || destination === null || destination === '') {
    return true;
  }
  if (typeof destination !== 'string') {
    return false;
  }
  const trimmed = destination.trim();
  if (trimmed === '') {
    return true;
  }
  // Must start with exactly one forward slash, not // or /\ or /%2f
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.startsWith('/%2f') ||
    trimmed.startsWith('/%2F')
  ) {
    return false;
  }
  // Disallow backslashes anywhere in path
  if (trimmed.includes('\\')) {
    return false;
  }
  // Disallow control characters or newlines
  if (/[\r\n\t\0]/.test(trimmed)) {
    return false;
  }
  // Disallow explicit scheme patterns anywhere
  if (
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ||
    /^(javascript|data|vbscript|file|about):/i.test(trimmed)
  ) {
    return false;
  }
  // Try URL parsing relative to dummy base to detect scheme or host tampering
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return false;
    }
    if (!parsed.pathname.startsWith('/')) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

export const safeDestinationSchema = z
  .string()
  .optional()
  .refine((val) => isValidSafeDestination(val), {
    message:
      'Invalid redirect destination: must be a safe local path (e.g. /users/profile)',
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  destination: safeDestinationSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const mfaVerifySchema = z.object({
  factorId: z.string().uuid('Invalid factor identifier format'),
  code: z
    .string()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
  destination: safeDestinationSchema,
});

export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
