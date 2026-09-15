import { HostingRepository } from '../repositories/hosting.repository';
import {
  OnboardingWorkspaceViewModel,
  HostPolicyType,
  AuditContext,
} from '../types/hosting.types';
import { buildOnboardingWizardViewModel } from '../view-models/hosting.viewmodels';
import { HostingEligibilityPolicy } from '../policies/HostingEligibilityPolicy';
import { HostingOnboardingPolicy } from '../policies/HostingOnboardingPolicy';
import { MANDATORY_HOST_POLICIES } from '../constants/hosting.constants';

/**
 * Thin orchestration service managing the onboarding workflow, status transitions, and step progression.
 * Coordinates Repositories -> Policies -> ViewModels without inline SQL or business state duplication.
 */
export class HostingService {
  private readonly repository = new HostingRepository();

  /**
   * Retrieves the full onboarding and eligibility ViewModel for /host/onboarding.
   */
  public async getOnboardingWorkspace(
    userId: string,
    activeStepParam?: string | null
  ): Promise<OnboardingWorkspaceViewModel> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const policyAcceptances = hostProfile
      ? await this.repository.getPolicyAcceptances(hostProfile.id)
      : [];
    const userContext = await this.repository.getUserIdentityContext(userId);
    const accommodationInfo =
      await this.repository.getAccommodationTypeInfoById(
        hostProfile?.primary_accommodation_type_id ?? null
      );

    return buildOnboardingWizardViewModel(
      userId,
      hostProfile,
      userContext,
      activeStepParam,
      accommodationInfo,
      policyAcceptances
    );
  }

  /**
   * Starts or resumes hosting onboarding for a guest user via controlled RPC.
   */
  public async initializeOnboarding() {
    return this.repository.initializeHostOnboarding();
  }

  /**
   * Step 1 Submission: Records identity submission facts and ensures host profile exists.
   */
  public async submitIdentityStep(
    userId: string,
    fullName: string,
    phone: string
  ): Promise<void> {
    let hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (!hostProfile) {
      hostProfile = await this.repository.initializeHostOnboarding();
    }

    await this.repository.recordIdentitySubmission(userId, fullName, phone);
  }

  /**
   * Step 2 Submission: Records payout bank fact references after validating step prerequisites.
   */
  public async submitBankStep(
    userId: string,
    bankName: string,
    accountNumber: string
  ): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (!hostProfile) {
      throw new Error(
        'Cannot submit payout details: Host onboarding not initialized.'
      );
    }

    const policyAcceptances = await this.repository.getPolicyAcceptances(
      hostProfile.id
    );
    const audit = HostingEligibilityPolicy.evaluate(
      hostProfile,
      policyAcceptances
    );
    const canEnter = HostingOnboardingPolicy.canEnterStep(
      'bank',
      hostProfile,
      audit
    );

    if (!canEnter) {
      throw new Error(
        'Cannot submit payout details: Identity verification step must be completed first.'
      );
    }

    await this.repository.recordPayoutInstrument(
      userId,
      bankName,
      accountNumber
    );
  }

  /**
   * Records an explicit immutable acceptance of a versioned policy.
   */
  public async submitPolicyAcceptance(
    policyType: HostPolicyType,
    version: string,
    clientContext: Record<string, unknown> = {}
  ): Promise<string> {
    return this.repository.recordPolicyAcceptance(
      policyType,
      version,
      clientContext
    );
  }

  /**
   * Step 4 Submission: Records operational SLA and anti-discrimination policy agreements.
   * Gated strictly by step prerequisites and attaches server-side audit context.
   */
  public async submitPoliciesStep(
    userId: string,
    auditContext?: AuditContext
  ): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (!hostProfile) {
      throw new Error(
        'Cannot submit policy agreements: Host onboarding not initialized.'
      );
    }

    const policyAcceptances = await this.repository.getPolicyAcceptances(
      hostProfile.id
    );
    const audit = HostingEligibilityPolicy.evaluate(
      hostProfile,
      policyAcceptances
    );
    const canEnter = HostingOnboardingPolicy.canEnterStep(
      'policies',
      hostProfile,
      audit
    );

    if (!canEnter) {
      throw new Error(
        'Cannot submit policy agreements: Prior onboarding prerequisites (Identity & Bank Setup) must be completed first.'
      );
    }

    const clientPayload: Record<string, unknown> = {
      source: 'onboarding_step_4',
      submitted_at: auditContext?.submittedAt || new Date().toISOString(),
      request: {
        user_agent: auditContext?.userAgent || null,
        x_forwarded_for: auditContext?.ipAddress || null,
      },
      metadata: auditContext?.metadata || {},
    };

    const antiDiscriminationVersion =
      MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version;
    const maintenanceSlaVersion =
      MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version;

    await this.repository.recordPolicyAcceptance(
      'ANTI_DISCRIMINATION',
      antiDiscriminationVersion,
      clientPayload
    );

    await this.repository.recordPolicyAcceptance(
      'MAINTENANCE_SLA',
      maintenanceSlaVersion,
      clientPayload
    );
  }

  /**
   * Step 5 Completion: Evaluates overall eligibility and executes controlled transition to READY.
   * Confirms persisted state matches READY before acknowledging success.
   */
  public async confirmReadyToHost(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (!hostProfile) {
      return {
        success: false,
        message: 'Host profile does not exist.',
      };
    }

    const policyAcceptances = await this.repository.getPolicyAcceptances(
      hostProfile.id
    );
    const userContext = await this.repository.getUserIdentityContext(userId);
    const audit = HostingEligibilityPolicy.evaluate(
      hostProfile,
      policyAcceptances,
      userContext
    );

    const canTransition = HostingOnboardingPolicy.canTransitionToReady(
      hostProfile,
      audit
    );

    if (!canTransition || !audit.isEligible) {
      return {
        success: false,
        message:
          'Please fulfill all verification requirements and declare your accommodation specialization before advancing to ready status.',
      };
    }

    const result = await this.repository.transitionHostToReady();
    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Failed to transition to ready status',
      };
    }

    // Authoritative verification: check persisted state
    const persisted = await this.repository.getHostProfileByUserId(userId);
    if (persisted?.status !== 'READY') {
      return {
        success: false,
        message: 'Persisted host status did not achieve READY.',
      };
    }

    return { success: true };
  }

  /**
   * Verifies host capability before creating a draft listing.
   */
  public async requireReadyOrActiveHost(userId: string): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (
      !hostProfile ||
      (hostProfile.status !== 'READY' && hostProfile.status !== 'ACTIVE')
    ) {
      throw new Error(
        'Host capability required: Host must achieve READY or ACTIVE status before creating listings.'
      );
    }
  }

  /**
   * Transitions host profile from READY to ACTIVE upon listing publication via controlled RPC.
   */
  public async transitionToActive(): Promise<{
    success: boolean;
    message?: string;
  }> {
    const result = await this.repository.transitionHostToActive();
    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Failed to transition to active status',
      };
    }
    return { success: true };
  }

  /**
   * Controlled operational status toggling between ACTIVE and PAUSED.
   */
  public async toggleOperationalStatus(
    status: 'ACTIVE' | 'PAUSED'
  ): Promise<{ success: boolean; message?: string }> {
    const result =
      await this.repository.transitionHostOperationalStatus(status);
    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Failed to update operational status',
      };
    }
    return { success: true };
  }
}
