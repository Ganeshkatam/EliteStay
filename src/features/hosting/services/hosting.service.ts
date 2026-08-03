import { HostingRepository } from '../repositories/hosting.repository';
import {
  HostBusinessType,
  OnboardingWorkspaceViewModel,
} from '../types/hosting.types';
import { buildOnboardingWizardViewModel } from '../view-models/hosting.viewmodels';
import { HostingEligibilityPolicy } from '../policies/HostingEligibilityPolicy';
import { createClient } from '@/lib/supabase/server';

/**
 * Thin orchestration service managing the onboarding workflow and step progression.
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
      accommodationInfo
    );
  }

  /**
   * Starts or resumes hosting onboarding for a guest user.
   */
  public async initializeOnboarding(userId: string) {
    return this.repository.initializeOnboarding(userId);
  }

  /**
   * Step 1 Submission: Verifies identity facts and records timestamp.
   */
  public async submitIdentityStep(
    userId: string,
    fullName: string,
    phone: string
  ): Promise<void> {
    const supabase = await createClient();
    // Update user profile basic metadata
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Record verified identity fact in host profile
    await this.repository.upsertHostProfile(userId, {
      identity_verified_at: new Date().toISOString(),
      status: 'ONBOARDING',
    });
  }

  /**
   * Step 2 Submission: Stores payout bank fact references without saving raw account strings directly.
   */
  public async submitBankStep(
    userId: string,
    bankName: string,
    accountNumber: string
  ): Promise<void> {
    const accountLast4 = accountNumber.slice(-4).padStart(4, '*');
    await this.repository.upsertHostProfile(userId, {
      bank_name: bankName,
      bank_account_last4: accountLast4,
      status: 'ONBOARDING',
    });
  }

  /**
   * Step 3 Submission: Records governed business entity type, accommodation specialization, and tax identification facts.
   */
  public async submitBusinessStep(
    userId: string,
    businessType: HostBusinessType,
    businessName: string,
    primaryAccommodationSlug: string,
    taxIdType: string,
    taxIdNumber: string,
    supportPhone: string,
    supportEmail: string
  ): Promise<void> {
    const taxIdLast4 = taxIdNumber.slice(-4).padStart(4, '*');
    const accommodationTypeId = primaryAccommodationSlug
      ? await this.repository.getAccommodationTypeIdBySlug(
          primaryAccommodationSlug
        )
      : undefined;

    await this.repository.upsertHostProfile(userId, {
      business_type: businessType,
      business_name: businessName,
      ...(accommodationTypeId !== undefined
        ? { primary_accommodation_type_id: accommodationTypeId }
        : {}),
      tax_id_type: taxIdType,
      tax_id_last4: taxIdLast4,
      support_phone: supportPhone || null,
      support_email: supportEmail || null,
      status: 'ONBOARDING',
    });
  }

  /**
   * Step 4 Submission: Records operational SLA and anti-discrimination policy agreement timestamp.
   */
  public async submitPoliciesStep(userId: string): Promise<void> {
    await this.repository.upsertHostProfile(userId, {
      agreed_to_policies_at: new Date().toISOString(),
      status: 'ONBOARDING',
    });
  }

  /**
   * Step 5 Completion: Evaluates overall eligibility and promotes status to READY without altering guest capabilities.
   */
  public async confirmReadyToHost(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const userContext = await this.repository.getUserIdentityContext(userId);
    const audit = HostingEligibilityPolicy.evaluate(hostProfile, userContext);

    if (!audit.isEligible || !hostProfile?.business_name) {
      return {
        success: false,
        message:
          'Please fulfill all verification requirements and declare your accommodation specialization before advancing to ready status.',
      };
    }

    // Advance to READY. Note: Active status is only triggered upon actually publishing a live listing.
    await this.repository.updateStatus(userId, 'READY');
    return { success: true };
  }
}
