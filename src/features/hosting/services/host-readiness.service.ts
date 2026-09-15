import { HostingRepository } from '../repositories/hosting.repository';
import {
  ListingPublicationEligibilityPolicy,
  ListingPublicationContext,
} from '../policies/ListingPublicationEligibilityPolicy';
import { ListingPublicationEligibility } from '../types/hosting.types';

/**
 * Dedicated orchestration service for host compliance, financial setup, and listing publication readiness.
 * Keeps workspace compliance management cleanly separated from the initial 3-step onboarding wizard.
 */
export class HostReadinessService {
  private readonly repository = new HostingRepository();

  /**
   * Evaluates complete publication eligibility for a host and optional listing context.
   */
  public async getPublicationEligibility(
    userId: string,
    listing?: ListingPublicationContext | null
  ): Promise<ListingPublicationEligibility> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const policyAcceptances = hostProfile
      ? await this.repository.getPolicyAcceptances(hostProfile.id)
      : [];

    return ListingPublicationEligibilityPolicy.evaluate(
      hostProfile,
      policyAcceptances,
      listing
    );
  }

  /**
   * Records workspace payout account information.
   */
  public async savePayoutAccount(
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
   * Sets or updates accommodation specialization before live publication.
   */
  public async setAccommodationSpecialization(
    userId: string,
    slug: string
  ): Promise<void> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    if (hostProfile?.status === 'ACTIVE' || hostProfile?.status === 'PAUSED') {
      throw new Error(
        'Accommodation specialization is permanently locked for active operational hosts.'
      );
    }

    const typeId = await this.repository.getAccommodationTypeIdBySlug(slug);
    if (!typeId) {
      throw new Error(`Invalid accommodation type: ${slug}`);
    }

    await this.repository.setAccommodationSpecialization(userId, typeId);
  }
}
