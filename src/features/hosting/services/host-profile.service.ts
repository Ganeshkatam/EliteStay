import { HostingRepository } from '../repositories/hosting.repository';
import {
  HostBusinessType,
  HostProfileWorkspaceViewModel,
} from '../types/hosting.types';
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
    const userContext = await this.repository.getUserIdentityContext(userId);
    const accommodationInfo =
      await this.repository.getAccommodationTypeInfoById(
        hostProfile?.primary_accommodation_type_id ?? null
      );

    return buildHostProfileWorkspaceViewModel(
      userId,
      hostProfile,
      userContext,
      accommodationInfo
    );
  }

  /**
   * Updates governed business entity settings on the host profile. Enforces immutability of specialization post-activation.
   */
  public async updateBusinessDetails(
    userId: string,
    businessType: HostBusinessType,
    businessName: string,
    supportPhone?: string,
    supportEmail?: string,
    primaryAccommodationSlug?: string
  ): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const isLocked =
      hostProfile?.status === 'ACTIVE' ||
      hostProfile?.status === 'PAUSED' ||
      hostProfile?.status === 'SUSPENDED';

    let accommodationTypeId: string | null | undefined = undefined;
    if (primaryAccommodationSlug && !isLocked) {
      accommodationTypeId = await this.repository.getAccommodationTypeIdBySlug(
        primaryAccommodationSlug
      );
    } else if (primaryAccommodationSlug && isLocked) {
      // Ignore alteration attempt if specialization is locked post-activation
      console.warn(
        '[HostProfileService] Ignored attempt to modify primary accommodation specialization on an ACTIVE profile.'
      );
    }

    await this.repository.upsertHostProfile(userId, {
      business_type: businessType,
      business_name: businessName,
      support_phone: supportPhone || null,
      support_email: supportEmail || null,
      ...(accommodationTypeId !== undefined
        ? { primary_accommodation_type_id: accommodationTypeId }
        : {}),
    });
  }

  /**
   * Updates payout bank references in the host entity.
   */
  public async updatePayoutDetails(
    userId: string,
    bankName: string,
    accountNumberOrLast4: string
  ): Promise<void> {
    const last4 =
      accountNumberOrLast4.length > 4
        ? accountNumberOrLast4.slice(-4).padStart(4, '*')
        : accountNumberOrLast4;

    await this.repository.upsertHostProfile(userId, {
      bank_name: bankName,
      bank_account_last4: last4,
    });
  }

  /**
   * Toggles operational status between active and paused (when a host intentionally halts operations).
   */
  public async toggleOperationalStatus(
    userId: string,
    newStatus: 'ACTIVE' | 'PAUSED' | 'READY'
  ): Promise<void> {
    await this.repository.updateStatus(userId, newStatus);
  }
}
