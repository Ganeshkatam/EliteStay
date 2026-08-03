import {
  HostProfileRow,
  EligibilityFactAudit,
  OnboardingStep,
} from '../types/hosting.types';

/**
 * Domain Policy governing configuration-driven host onboarding step transitions and completion.
 * Derives completion state without storing redundant flags in the database.
 */
export class HostingOnboardingPolicy {
  /**
   * Generates the dynamic step configuration sequence based on verified underlying facts.
   */
  public static evaluateSteps(
    hostProfile: HostProfileRow | null,
    eligibilityAudit: EligibilityFactAudit,
    activeStepParam?: string | null
  ): {
    steps: OnboardingStep[];
    currentStepId: string;
    isOnboardingComplete: boolean;
  } {
    const isIdentityDone = eligibilityAudit.hasIdentityVerifiedFact;
    const isBankDone = eligibilityAudit.hasBankLinkedFact;
    const isBusinessDone = Boolean(
      eligibilityAudit.hasTaxRegisteredFact &&
      eligibilityAudit.hasSpecializationFact &&
      hostProfile?.business_name
    );
    const isPoliciesDone = eligibilityAudit.hasPoliciesAgreedFact;

    const allRequiredCompleted =
      isIdentityDone && isBankDone && isBusinessDone && isPoliciesDone;
    const isAlreadyReadyOrActive =
      hostProfile?.status === 'READY' || hostProfile?.status === 'ACTIVE';

    const baseSteps: Array<Omit<OnboardingStep, 'isCurrent'>> = [
      {
        id: 'eligibility',
        title: 'Eligibility Overview',
        description:
          'Review mandatory criteria required to publish and operate accommodations on EliteStay.',
        required: false,
        isCompleted: eligibilityAudit.isEligible,
        nextStepId: 'identity',
      },
      {
        id: 'identity',
        title: 'Identity & Contact',
        description:
          'Confirm official legal name, verified phone number, and primary identity details.',
        required: true,
        isCompleted: isIdentityDone,
        nextStepId: 'bank',
      },
      {
        id: 'bank',
        title: 'Payout Bank Account',
        description:
          'Link a bank account where resident reservation settlements will be disbursed.',
        required: true,
        isCompleted: isBankDone,
        nextStepId: 'business',
      },
      {
        id: 'business',
        title: 'Business & Accommodation Model',
        description:
          'Specify your operating entity and select exclusively one accommodation specialization (PG, Hostel, Home, or Other).',
        required: true,
        isCompleted: isBusinessDone,
        nextStepId: 'policies',
      },
      {
        id: 'policies',
        title: 'Trust & Operational SLAs',
        description:
          'Agree to EliteStay resident anti-discrimination policies and response time standards.',
        required: true,
        isCompleted: isPoliciesDone,
        nextStepId: 'ready',
      },
      {
        id: 'ready',
        title: 'Ready to Host',
        description:
          'Onboarding complete! Launch into the Publishing Workspace to build your first listing.',
        required: false,
        isCompleted: isAlreadyReadyOrActive || allRequiredCompleted,
      },
    ];

    // Determine current active step
    let currentStepId: string = 'eligibility';
    if (activeStepParam && baseSteps.some((s) => s.id === activeStepParam)) {
      currentStepId = activeStepParam;
    } else if (isAlreadyReadyOrActive || allRequiredCompleted) {
      currentStepId = 'ready';
    } else {
      // Find the first uncompleted required step, or default to eligibility
      const firstUncompleted = baseSteps.find(
        (s) => s.required && !s.isCompleted
      );
      if (firstUncompleted) {
        currentStepId = firstUncompleted.id;
      }
    }

    const steps: OnboardingStep[] = baseSteps.map((s) => ({
      ...s,
      isCurrent: s.id === currentStepId,
    }));

    return {
      steps,
      currentStepId,
      isOnboardingComplete: allRequiredCompleted || isAlreadyReadyOrActive,
    };
  }

  /**
   * Validates whether a host profile can legally advance to READY status.
   */
  public static canTransitionToReady(
    hostProfile: HostProfileRow | null,
    eligibilityAudit: EligibilityFactAudit
  ): boolean {
    if (!hostProfile) {
      return false;
    }
    return (
      eligibilityAudit.hasIdentityVerifiedFact &&
      eligibilityAudit.hasBankLinkedFact &&
      eligibilityAudit.hasTaxRegisteredFact &&
      eligibilityAudit.hasPoliciesAgreedFact &&
      eligibilityAudit.hasSpecializationFact &&
      Boolean(hostProfile.business_name)
    );
  }
}
