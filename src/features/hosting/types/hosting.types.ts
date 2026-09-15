/**
 * Domain types for the Hosting Bounded Context (User -> Host Bridge & Host Profile).
 * Governed by Capability-Based Design: hosts retain guest status while operating accommodations.
 */

export type HostStatus =
  'NOT_STARTED' | 'ONBOARDING' | 'READY' | 'ACTIVE' | 'PAUSED' | 'SUSPENDED';

export type VerificationStatus =
  'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type HostPolicyType = 'ANTI_DISCRIMINATION' | 'MAINTENANCE_SLA';

export type HostSpecializationSlug = 'pg' | 'hostel' | 'apartment' | 'other';

/**
 * Database Row Model representing permanent entity facts in public.host_profiles.
 */
export interface HostProfileRow {
  id: string;
  user_id: string;
  status: HostStatus;
  primary_accommodation_type_id: string | null;
  bank_account_id: string | null;
  bank_name: string | null;
  bank_account_last4: string | null;
  tax_profile_id: string | null;
  tax_id_last4: string | null;
  tax_id_type: string | null;
  identity_submitted_at: string | null;
  identity_verification_status: VerificationStatus;
  identity_verification_ref: string | null;
  identity_verified_at: string | null;
  payout_verification_status: VerificationStatus;
  payout_verified_at: string | null;
  tax_verification_status: VerificationStatus;
  tax_verified_at: string | null;
  agreed_to_policies_at: string | null;
  support_phone: string | null;
  support_email: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database Row Model representing immutable policy acceptance records in public.host_policy_acceptances.
 */
export interface HostPolicyAcceptanceRow {
  id: string;
  host_profile_id: string;
  policy_type: HostPolicyType;
  policy_version: string;
  accepted_at: string;
  client_context: {
    declared?: Record<string, unknown>;
    request?: {
      user_agent?: string | null;
      x_forwarded_for?: string | null;
    };
  };
  created_at: string;
}

/**
 * Server-side audit context captured by Server Actions and passed to domain services.
 */
export interface AuditContext {
  userAgent?: string | null;
  ipAddress?: string | null;
  submittedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Basic user profile context from public.profiles and auth session.
 */
export interface UserIdentityContext {
  id: string;
  email: string | null;
  displayName: string | null;
  fullName: string | null;
  phone: string | null;
  avatarStoragePath: string | null;
}

/**
 * Authoritative Fact: Host Identity Verification
 */
export interface HostIdentityFact {
  submittedAt: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verificationRef: string | null;
}

/**
 * Authoritative Fact: Payout Instrument & Banking
 */
export interface HostPayoutFact {
  instrumentId: string | null;
  bankName: string | null;
  accountLast4: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
}

/**
 * Authoritative Fact: Tax Registration & Compliance
 */
export interface HostTaxFact {
  profileId: string | null;
  taxIdType: string | null;
  taxIdLast4: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
}

/**
 * Authoritative Fact: Accommodation Specialization
 */
export interface HostSpecializationFact {
  accommodationTypeId: string | null;
  accommodationSlug: string | null;
  accommodationName: string | null;
  isLocked: boolean;
}

/**
 * Authoritative Fact: Policy Acceptances
 */
export interface HostPolicyFact {
  acceptances: HostPolicyAcceptanceRow[];
  hasAcceptedAllMandatory: boolean;
  missingPolicies: string[];
}

/**
 * Itemized audit of runtime facts evaluating whether a host is eligible to operate.
 */
export interface EligibilityFactAudit {
  isEligible: boolean;
  hasIdentityVerifiedFact: boolean;
  hasBankLinkedFact: boolean;
  hasTaxRegisteredFact: boolean;
  hasPoliciesAgreedFact: boolean;
  hasSpecializationFact: boolean;
  missingRequirements: string[];
}

/**
 * Configuration-driven onboarding step representing a stage in the transformation journey.
 */
export interface OnboardingStep {
  id: 'eligibility' | 'identity' | 'bank' | 'policies' | 'ready';
  title: string;
  description: string;
  required: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  nextStepId?: string;
}

/**
 * Presentation ViewModel for the Host Onboarding Workspace (/host/onboarding).
 */
export interface OnboardingWorkspaceViewModel {
  userId: string;
  status: HostStatus;
  isEligible: boolean;
  isOnboardingComplete: boolean;
  currentStepId: string;
  steps: OnboardingStep[];
  eligibilityAudit: EligibilityFactAudit;
  formData: {
    fullName: string;
    phone: string;
    bankName: string;
    accountLast4: string;
    primaryAccommodationSlug: HostSpecializationSlug | string;
    taxIdLast4: string;
    taxIdType: string;
    supportPhone: string;
    supportEmail: string;
  };
}

/**
 * Presentation ViewModel for the permanent Host Profile settings workspace (/host/profile).
 */
export interface HostProfileWorkspaceViewModel {
  id: string | null;
  userId: string;
  status: HostStatus;
  isEligible: boolean;
  identitySummary: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    verifiedAt: string | null;
  };
  businessSummary: {
    primaryAccommodationSlug: HostSpecializationSlug | string | null;
    primaryAccommodationName: string;
    isSpecializationLocked: boolean;
    supportPhone: string | null;
    supportEmail: string | null;
  };
  payoutSummary: {
    bankName: string | null;
    bankAccountLast4: string | null;
    taxIdType: string | null;
    taxIdLast4: string | null;
    policiesAgreedAt: string | null;
  };
}
