import {
  HostProfileRow,
  EligibilityFactAudit,
  OnboardingStep,
} from '../types/hosting.types';

/**
 * Domain Policy governing configuration-driven host onboarding step transitions and completion.
 * Derives completion state and enforces prerequisite transition rules.
 */
export class HostingOnboardingPolicy {
  /**
   * Evaluates whether a host can legally enter or submit a given step based on completed prerequisites.
   */
  public static canEnterStep(
    stepId: string,
    hostProfile: HostProfileRow | null,
    eligibilityAudit: EligibilityFactAudit
  ): boolean {
    if (!hostProfile) {
      return stepId === 'eligibility' || stepId === 'identity';
    }

    if (hostProfile.status === 'READY' || hostProfile.status === 'ACTIVE') {
      return true;
    }

    switch (stepId) {
      case 'eligibility':
      case 'identity':
        return true;
      case 'bank':
        // Requires identity submitted
        return Boolean(
          hostProfile.identity_submitted_at ||
          eligibilityAudit.hasIdentityVerifiedFact
        );
      case 'tax':
        // Requires identity and bank submitted
        return Boolean(
          hostProfile.identity_submitted_at &&
          (hostProfile.bank_name || eligibilityAudit.hasBankLinkedFact)
        );
      case 'specialization':
        return Boolean(
          hostProfile.identity_submitted_at &&
          (hostProfile.bank_name || eligibilityAudit.hasBankLinkedFact)
        );
      case 'policies':
        // Requires previous steps submitted
        return Boolean(
          hostProfile.identity_submitted_at &&
          (hostProfile.bank_name || eligibilityAudit.hasBankLinkedFact) &&
          hostProfile.primary_accommodation_type_id
        );
      case 'ready':
        return eligibilityAudit.isEligible;
      default:
        return false;
    }
  }

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
    const isIdentityDone = Boolean(
      hostProfile?.identity_submitted_at ||
      eligibilityAudit.hasIdentityVerifiedFact
    );
    const isBankDone = Boolean(
      hostProfile?.bank_name || eligibilityAudit.hasBankLinkedFact
    );
    const isPoliciesDone = eligibilityAudit.hasPoliciesAgreedFact;

    const allRequiredCompleted = eligibilityAudit.isEligible;
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
   * Validates whether a host profile can advance to READY status.
   * Requires all 5 categories evaluated by HostingEligibilityPolicy to be true.
   */
  public static canTransitionToReady(
    hostProfile: HostProfileRow | null,
    eligibilityAudit: EligibilityFactAudit
  ): boolean {
    if (!hostProfile) {
      return false;
    }
    return (
      hostProfile.status === 'ONBOARDING' &&
      eligibilityAudit.isEligible === true
    );
  }
}
