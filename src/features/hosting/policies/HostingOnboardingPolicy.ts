import {
  HostProfileRow,
  HostOnboardingFactAudit,
  OnboardingStep,
} from '../types/hosting.types';

/**
 * Domain Policy governing the 3-step Host Onboarding state machine.
 * Lifecycle: Identity -> Specialization -> Policies -> READY.
 */
export class HostingOnboardingPolicy {
  /**
   * Evaluates whether a host can legally enter or submit a given step based on completed prerequisites.
   */
  public static canEnterStep(
    stepId: string,
    hostProfile: HostProfileRow | null,
    eligibilityAudit: HostOnboardingFactAudit
  ): boolean {
    if (!hostProfile) {
      return stepId === 'identity';
    }

    if (hostProfile.status === 'READY' || hostProfile.status === 'ACTIVE') {
      return true;
    }

    switch (stepId) {
      case 'identity':
        return true;
      case 'specialization':
        // Requires identity submitted
        return Boolean(
          hostProfile.identity_submitted_at ||
          eligibilityAudit.hasIdentitySubmittedFact
        );
      case 'policies':
        // Requires identity submitted and specialization set
        return Boolean(
          (hostProfile.identity_submitted_at ||
            eligibilityAudit.hasIdentitySubmittedFact) &&
          (hostProfile.primary_accommodation_type_id ||
            eligibilityAudit.hasSpecializationFact)
        );
      case 'ready':
        return eligibilityAudit.isEligible;
      default:
        return false;
    }
  }

  /**
   * Generates the 3-step onboarding sequence based on verified underlying facts.
   */
  public static evaluateSteps(
    hostProfile: HostProfileRow | null,
    eligibilityAudit: HostOnboardingFactAudit,
    activeStepParam?: string | null
  ): {
    steps: OnboardingStep[];
    currentStepId: string;
    isOnboardingComplete: boolean;
  } {
    const isIdentityDone = Boolean(
      hostProfile?.identity_submitted_at ||
      eligibilityAudit.hasIdentitySubmittedFact
    );
    const isSpecializationDone = Boolean(
      hostProfile?.primary_accommodation_type_id ||
      eligibilityAudit.hasSpecializationFact
    );
    const isPoliciesDone = eligibilityAudit.hasPoliciesAgreedFact;

    const allRequiredCompleted = eligibilityAudit.isEligible;
    const isAlreadyReadyOrActive =
      hostProfile?.status === 'READY' || hostProfile?.status === 'ACTIVE';

    const baseSteps: Array<Omit<OnboardingStep, 'isCurrent'>> = [
      {
        id: 'identity',
        title: 'Identity & Host Profile',
        description:
          'Declare legal name and primary phone contact to initialize your host profile.',
        required: true,
        isCompleted: isIdentityDone,
        nextStepId: 'specialization',
      },
      {
        id: 'specialization',
        title: 'Accommodation Specialization',
        description:
          'Select your primary accommodation domain (PG, Hostel, Apartment, or Other).',
        required: true,
        isCompleted: isSpecializationDone,
        nextStepId: 'policies',
      },
      {
        id: 'policies',
        title: 'Trust & Operational SLAs',
        description:
          'Agree to EliteStay resident anti-discrimination standards and operational SLAs.',
        required: true,
        isCompleted: isPoliciesDone,
        nextStepId: 'ready',
      },
      {
        id: 'ready',
        title: 'Ready for Workspace',
        description:
          'Onboarding complete! Access your host workspace to build listings and manage compliance.',
        required: false,
        isCompleted: isAlreadyReadyOrActive || allRequiredCompleted,
      },
    ];

    // Determine current active step
    let currentStepId: string = 'identity';
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
   * Requires all 3 onboarding requirements to be met.
   */
  public static canTransitionToReady(
    hostProfile: HostProfileRow | null,
    eligibilityAudit: HostOnboardingFactAudit
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
