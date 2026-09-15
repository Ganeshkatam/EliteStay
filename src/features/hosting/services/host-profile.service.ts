import { HostingRepository } from '../repositories/hosting.repository';
import { HostProfileWorkspaceViewModel } from '../types/hosting.types';
import { buildHostProfileWorkspaceViewModel } from '../view-models/hosting.viewmodels';

/**
 * Dedicated orchestration service for permanent Host Profile entity settings & business details.
 * Keeps business CRUD cleanly separated from onboarding workflow navigation.
 */
export class HostProfileService {
  private readonly repository = new HostingRepository();

  /**
   * Retrieves the permanent Host Profile settings ViewModel for /host/profile.
   */
  public async getHostProfileWorkspace(
    userId: string
  ): Promise<HostProfileWorkspaceViewModel> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const policyAcceptances = hostProfile
      ? await this.repository.getPolicyAcceptances(hostProfile.id)
      : [];
    const userContext = await this.repository.getUserIdentityContext(userId);
    const accommodationInfo =
      await this.repository.getAccommodationTypeInfoById(
        hostProfile?.primary_accommodation_type_id ?? null
      );

    return buildHostProfileWorkspaceViewModel(
      userId,
      hostProfile,
      userContext,
      accommodationInfo,
      policyAcceptances
    );
  }

  /**
   * Updates host profile support and accommodation settings. Enforces immutability of specialization post-activation.
   */
  public async updateHostDetails(
    userId: string,
    supportPhone?: string,
    supportEmail?: string,
    primaryAccommodationSlug?: string
  ): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const isLocked =
      hostProfile?.status === 'ACTIVE' ||
      hostProfile?.status === 'PAUSED' ||
      hostProfile?.status === 'SUSPENDED';

    if (primaryAccommodationSlug && !isLocked) {
      const accommodationTypeId =
        await this.repository.getAccommodationTypeIdBySlug(
          primaryAccommodationSlug
        );
      if (accommodationTypeId) {
        await this.repository.setAccommodationSpecialization(
          userId,
          accommodationTypeId
        );
      }
    } else if (primaryAccommodationSlug && isLocked) {
      console.warn(
        `[HostProfileService] Ignored attempt to modify locked accommodation specialization for host ${userId}`
      );
    }

    await this.repository.updatePresentationDetails(
      userId,
      supportPhone || null,
      supportEmail || null
    );
  }

  /**
   * Updates payout bank references in the host entity.
   */
  public async updatePayoutDetails(
    userId: string,
    bankName: string,
    accountNumberOrLast4: string
  ): Promise<void> {
    await this.repository.recordPayoutInstrument(
      userId,
      bankName,
      accountNumberOrLast4
    );
  }

  /**
   * Toggles operational status between active and paused via controlled RPC.
   */
  public async toggleOperationalStatus(
    userId: string,
    newStatus: 'ACTIVE' | 'PAUSED'
  ): Promise<void> {
    const result =
      await this.repository.transitionHostOperationalStatus(newStatus);
    if (!result.success) {
      throw new Error(
        `Failed to update operational status: ${result.error || 'Unknown error'}`
      );
    }
  }
}
