import {
  HostProfileRow,
  UserIdentityContext,
  EligibilityFactAudit,
} from '../types/hosting.types';

/**
 * Domain Policy governing runtime host eligibility calculation.
 * Follows the rule: Never persist what can be derived at runtime from underlying facts.
 */
export class HostingEligibilityPolicy {
  /**
   * Evaluates the host profile against required operational facts to determine eligibility.
   */
  public static evaluate(
    hostProfile: HostProfileRow | null,
    userContext?: UserIdentityContext | null
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
          'Link a valid payout bank account',
          'Declare primary accommodation specialization (PG, Hostel, Home, or Other)',
          'Register tax identification profile (PAN/GSTIN or SSN/EIN)',
          'Agree to EliteStay Host Platform & Resident Trust SLAs',
        ],
      };
    }

    // 1. Evaluate underlying verification facts
    const hasIdentityVerifiedFact = Boolean(
      hostProfile.identity_verified_at ||
      (userContext &&
        userContext.phone &&
        (userContext.fullName || userContext.displayName))
    );

    const hasBankLinkedFact = Boolean(
      hostProfile.bank_account_id || hostProfile.bank_account_last4
    );

    const hasTaxRegisteredFact = Boolean(
      hostProfile.tax_profile_id || hostProfile.tax_id_last4
    );

    const hasPoliciesAgreedFact = Boolean(hostProfile.agreed_to_policies_at);

    const hasSpecializationFact = Boolean(
      hostProfile.primary_accommodation_type_id
    );

    // 2. Compile missing items
    const missingRequirements: string[] = [];
    if (!hasIdentityVerifiedFact) {
      missingRequirements.push('Verify official identity and contact details');
    }
    if (!hasBankLinkedFact) {
      missingRequirements.push('Link a valid payout bank account');
    }
    if (!hasSpecializationFact) {
      missingRequirements.push(
        'Declare primary accommodation specialization (PG, Hostel, Home, or Other)'
      );
    }
    if (!hasTaxRegisteredFact) {
      missingRequirements.push('Register tax identification profile');
    }
    if (!hasPoliciesAgreedFact) {
      missingRequirements.push(
        'Agree to EliteStay Host Platform & Resident Trust SLAs'
      );
    }

    // 3. Derive runtime eligibility status
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
