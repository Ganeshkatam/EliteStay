import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
  HostOnboardingFactAudit,
  UserIdentityContext,
} from '../types/hosting.types';
import { MANDATORY_HOST_POLICIES } from '../constants/hosting.constants';

/**
 * Domain Policy governing host onboarding eligibility calculation (achieving READY status).
 * Answers: "Can this user complete onboarding and enter the host workspace?"
 * Evaluates exactly 3 facts:
 * 1. Identity profile submitted
 * 2. Accommodation specialization selected
 * 3. Mandatory policies accepted (at exact canonical versions)
 */
export class HostOnboardingEligibilityPolicy {
  public static evaluate(
    hostProfile: HostProfileRow | null,
    policyAcceptances: HostPolicyAcceptanceRow[] = [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userContext?: UserIdentityContext | null
  ): HostOnboardingFactAudit {
    if (!hostProfile) {
      return {
        isEligible: false,
        hasIdentitySubmittedFact: false,
        hasSpecializationFact: false,
        hasPoliciesAgreedFact: false,
        missingRequirements: [
          'Submit official host profile and contact details',
          'Select primary accommodation specialization (PG, Hostel, Apartment, or Other)',
          `Agree to ${MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.title} (v${MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version})`,
          `Agree to ${MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.title} (v${MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version})`,
        ],
      };
    }

    // 1. Identity submitted fact (submission timestamp exists)
    const hasIdentitySubmittedFact = Boolean(hostProfile.identity_submitted_at);

    // 2. Specialization declared fact
    const hasSpecializationFact = Boolean(
      hostProfile.primary_accommodation_type_id
    );

    // 3. Mandatory policy acceptances with exact version match
    const hasAcceptedAntiDiscrimination = policyAcceptances.some(
      (a) =>
        a.policy_type === 'ANTI_DISCRIMINATION' &&
        a.policy_version === MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version
    );

    const hasAcceptedMaintenanceSla = policyAcceptances.some(
      (a) =>
        a.policy_type === 'MAINTENANCE_SLA' &&
        a.policy_version === MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version
    );

    const hasPoliciesAgreedFact =
      hasAcceptedAntiDiscrimination && hasAcceptedMaintenanceSla;

    // Missing requirements
    const missingRequirements: string[] = [];
    if (!hasIdentitySubmittedFact) {
      missingRequirements.push(
        'Submit official host profile and contact details'
      );
    }
    if (!hasSpecializationFact) {
      missingRequirements.push(
        'Select primary accommodation specialization (PG, Hostel, Apartment, or Other)'
      );
    }
    if (!hasPoliciesAgreedFact) {
      if (!hasAcceptedAntiDiscrimination) {
        missingRequirements.push(
          `Agree to ${MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.title} (v${MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version})`
        );
      }
      if (!hasAcceptedMaintenanceSla) {
        missingRequirements.push(
          `Agree to ${MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.title} (v${MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version})`
        );
      }
    }

    const isEligible =
      hasIdentitySubmittedFact &&
      hasSpecializationFact &&
      hasPoliciesAgreedFact;

    return {
      isEligible,
      hasIdentitySubmittedFact,
      hasSpecializationFact,
      hasPoliciesAgreedFact,
      missingRequirements,
    };
  }
}

/**
 * Backward compatibility alias
 */
export const HostingEligibilityPolicy = HostOnboardingEligibilityPolicy;
