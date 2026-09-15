import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
  EligibilityFactAudit,
  UserIdentityContext,
} from '../types/hosting.types';
import { MANDATORY_HOST_POLICIES } from '../constants/hosting.constants';

/**
 * Domain Policy governing runtime host eligibility calculation.
 * Follows the rule: Never persist what can be derived at runtime from underlying authoritative facts.
 */
export class HostingEligibilityPolicy {
  /**
   * Evaluates the host profile against required operational facts to determine eligibility.
   * Grounded strictly in authoritative verification statuses and versioned policy acceptances.
   */
  public static evaluate(
    hostProfile: HostProfileRow | null,
    policyAcceptances: HostPolicyAcceptanceRow[] = [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userContext?: UserIdentityContext | null
  ): EligibilityFactAudit {
    if (!hostProfile) {
      return {
        isEligible: false,
        hasIdentityVerifiedFact: false,
        hasBankLinkedFact: false,
        hasTaxRegisteredFact: false,
        hasPoliciesAgreedFact: false,
        hasSpecializationFact: false,
        missingRequirements: [
          'Verify official identity and contact details',
          'Link a verified payout bank account',
          'Declare primary accommodation specialization (PG, Hostel, Home, or Other)',
          'Register verified tax identification profile (PAN/GSTIN or SSN/EIN)',
          'Agree to active EliteStay Host Platform & Resident Trust SLAs',
        ],
      };
    }

    // 1. Evaluate underlying authoritative verification facts
    const hasIdentityVerifiedFact =
      hostProfile.identity_verification_status === 'VERIFIED' &&
      Boolean(hostProfile.identity_verified_at);

    const hasBankLinkedFact =
      hostProfile.payout_verification_status === 'VERIFIED' &&
      Boolean(hostProfile.payout_verified_at);

    const hasTaxRegisteredFact =
      hostProfile.tax_verification_status === 'VERIFIED' &&
      Boolean(hostProfile.tax_verified_at);

    const hasSpecializationFact = Boolean(
      hostProfile.primary_accommodation_type_id
    );

    // 2. Evaluate mandatory policy acceptances with exact version match
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

    // 3. Compile missing items
    const missingRequirements: string[] = [];
    if (!hasIdentityVerifiedFact) {
      missingRequirements.push('Verify official identity and contact details');
    }
    if (!hasBankLinkedFact) {
      missingRequirements.push('Link a verified payout bank account');
    }
    if (!hasSpecializationFact) {
      missingRequirements.push(
        'Declare primary accommodation specialization (PG, Hostel, Home, or Other)'
      );
    }
    if (!hasTaxRegisteredFact) {
      missingRequirements.push('Register verified tax identification profile');
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

    // 4. Derive runtime eligibility status
    const isEligible =
      hasIdentityVerifiedFact &&
      hasBankLinkedFact &&
      hasTaxRegisteredFact &&
      hasPoliciesAgreedFact &&
      hasSpecializationFact;

    return {
      isEligible,
      hasIdentityVerifiedFact,
      hasBankLinkedFact,
      hasTaxRegisteredFact,
      hasPoliciesAgreedFact,
      hasSpecializationFact,
      missingRequirements,
    };
  }
}
