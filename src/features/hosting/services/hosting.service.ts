import { HostingRepository } from '../repositories/hosting.repository';
import {
  OnboardingWorkspaceViewModel,
  HostPolicyType,
} from '../types/hosting.types';
import { buildOnboardingWizardViewModel } from '../view-models/hosting.viewmodels';
import { HostingEligibilityPolicy } from '../policies/HostingEligibilityPolicy';
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
  public async initializeOnboarding(_userId?: string) {
    return this.repository.initializeHostOnboarding();
  }

  /**
   * Step 1 Submission: Records identity submission and updates public profile context.
   */
  public async submitIdentityStep(
    userId: string,
    fullName: string,
    phone: string
  ): Promise<void> {
    await this.repository.recordIdentitySubmission(userId, fullName, phone);
  }

  /**
   * Step 2 Submission: Records payout bank fact references without saving raw account strings directly.
   */
  public async submitBankStep(
    userId: string,
    bankName: string,
    accountNumber: string
  ): Promise<void> {
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
   */
  public async submitPoliciesStep(_userId?: string): Promise<void> {
    const antiDiscriminationVersion =
      MANDATORY_HOST_POLICIES.ANTI_DISCRIMINATION.version;
    const maintenanceSlaVersion =
      MANDATORY_HOST_POLICIES.MAINTENANCE_SLA.version;

    await this.repository.recordPolicyAcceptance(
      'ANTI_DISCRIMINATION',
      antiDiscriminationVersion,
      { submitted_via: 'onboarding_step_4' }
    );

    await this.repository.recordPolicyAcceptance(
      'MAINTENANCE_SLA',
      maintenanceSlaVersion,
      { submitted_via: 'onboarding_step_4' }
    );
  }

  /**
   * Step 5 Completion: Evaluates overall eligibility and executes controlled transition to READY.
   */
  public async confirmReadyToHost(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const policyAcceptances = hostProfile
      ? await this.repository.getPolicyAcceptances(hostProfile.id)
      : [];
    const userContext = await this.repository.getUserIdentityContext(userId);
    const audit = HostingEligibilityPolicy.evaluate(
      hostProfile,
      policyAcceptances,
      userContext
    );

    if (!audit.isEligible) {
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

    return { success: true };
  }

  /**
   * Transitions host profile from READY to ACTIVE upon listing publication via controlled RPC.
   */
  public async transitionToActive(
    _userId?: string
  ): Promise<{ success: boolean; message?: string }> {
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
    _userId: string | undefined,
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
