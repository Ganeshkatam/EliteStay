import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
  UserIdentityContext,
  OnboardingWorkspaceViewModel,
  HostProfileWorkspaceViewModel,
} from '../types/hosting.types';
import { HostingEligibilityPolicy } from '../policies/HostingEligibilityPolicy';
import { HostingOnboardingPolicy } from '../policies/HostingOnboardingPolicy';

/**
 * ViewModel factory functions composing immutable presentation contracts for Hosting workspaces.
 * Strictly adheres to the ViewModel Rule and Operational Workspace Rule.
 */

/**
 * Builds the Onboarding Workspace ViewModel (/host/onboarding) combining eligibility audits and wizard step sequences.
 */
export function buildOnboardingWizardViewModel(
  userId: string,
  hostProfile: HostProfileRow | null,
  userContext: UserIdentityContext | null,
  stepParam?: string | null,
  accommodationInfo?: { slug: string | null; name: string },
  policyAcceptances: HostPolicyAcceptanceRow[] = []
): OnboardingWorkspaceViewModel {
  const eligibilityAudit = HostingEligibilityPolicy.evaluate(
    hostProfile,
    policyAcceptances,
    userContext
  );
  const { steps, currentStepId, isOnboardingComplete } =
    HostingOnboardingPolicy.evaluateSteps(
      hostProfile,
      eligibilityAudit,
      stepParam
    );

  const status = hostProfile?.status ?? 'NOT_STARTED';

  return {
    userId,
    status,
    isEligible: eligibilityAudit.isEligible,
    isOnboardingComplete,
    currentStepId,
    steps,
    eligibilityAudit,
    formData: {
      fullName: userContext?.fullName ?? userContext?.displayName ?? '',
      phone: userContext?.phone ?? '',
      primaryAccommodationSlug: accommodationInfo?.slug ?? '',
      supportPhone: hostProfile?.support_phone ?? userContext?.phone ?? '',
      supportEmail: hostProfile?.support_email ?? userContext?.email ?? '',
    },
  };
}

/**
 * Builds the permanent Host Profile Workspace ViewModel (/host/profile) displaying verified identity and settings.
 */
export function buildHostProfileWorkspaceViewModel(
  userId: string,
  hostProfile: HostProfileRow | null,
  userContext: UserIdentityContext | null,
  accommodationInfo?: { slug: string | null; name: string },
  policyAcceptances: HostPolicyAcceptanceRow[] = []
): HostProfileWorkspaceViewModel {
  const eligibilityAudit = HostingEligibilityPolicy.evaluate(
    hostProfile,
    policyAcceptances,
    userContext
  );
  const status = hostProfile?.status ?? 'NOT_STARTED';

  // Immutability rule: specialization is permanently locked once active operational status is reached
  const isSpecializationLocked =
    status === 'ACTIVE' || status === 'PAUSED' || status === 'SUSPENDED';

  const latestPolicyAcceptance =
    policyAcceptances.length > 0
      ? policyAcceptances[policyAcceptances.length - 1].created_at
      : null;

  return {
    id: hostProfile?.id ?? null,
    userId,
    status,
    isEligible: eligibilityAudit.isEligible,
    identitySummary: {
      fullName: userContext?.fullName ?? userContext?.displayName ?? null,
      email: userContext?.email ?? null,
      phone: userContext?.phone ?? null,
      verifiedAt: hostProfile?.identity_verified_at ?? null,
    },
    businessSummary: {
      primaryAccommodationSlug: accommodationInfo?.slug ?? null,
      primaryAccommodationName: accommodationInfo?.name ?? 'Not designated',
      isSpecializationLocked,
      supportPhone: hostProfile?.support_phone ?? null,
      supportEmail: hostProfile?.support_email ?? null,
    },
    payoutSummary: {
      bankName: hostProfile?.bank_name ?? null,
      bankAccountLast4: hostProfile?.bank_account_last4 ?? null,
      taxIdType: hostProfile?.tax_id_type ?? null,
      taxIdLast4: hostProfile?.tax_id_last4 ?? null,
      policiesAgreedAt:
        hostProfile?.agreed_to_policies_at ?? latestPolicyAcceptance,
    },
  };
}
