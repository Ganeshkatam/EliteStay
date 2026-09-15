import { HostingRepository } from '../repositories/hosting.repository';
import {
  ListingPublicationEligibilityPolicy,
  ListingPublicationContext,
} from '../policies/ListingPublicationEligibilityPolicy';
import { ListingPublicationEligibility } from '../types/hosting.types';

export interface HostComplianceSummary {
  userId: string;
  hostProfileId: string | null;
  status: string;
  identity: {
    isSubmitted: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
    reference: string | null;
  };
  payout: {
    isConfigured: boolean;
    isVerified: boolean;
    bankName: string | null;
    accountLast4: string | null;
    verifiedAt: string | null;
  };
  tax: {
    isRegistered: boolean;
    isVerified: boolean;
    taxIdLast4: string | null;
    taxProfileId: string | null;
    verifiedAt: string | null;
  };
  specialization: {
    isSet: boolean;
    typeId: string | null;
    slug: string | null;
    name: string;
  };
  policies: {
    areAllCurrent: boolean;
    acceptedCount: number;
  };
}

/**
 * HostComplianceService: Sole authority for Host Workspace Publication Compliance.
 * Explicitly separated from the 3-step Onboarding domain.
 */
export class HostComplianceService {
  private readonly repository: HostingRepository;

  constructor(repository?: HostingRepository) {
    this.repository = repository ?? new HostingRepository();
  }

  /**
   * Retrieves an immutable compliance summary projection for the host workspace.
   */
  public async getComplianceSummary(
    userId: string
  ): Promise<HostComplianceSummary> {
    const hostProfile = await this.repository.getHostProfileByUserId(userId);
    const policyAcceptances = hostProfile
      ? await this.repository.getPolicyAcceptances(hostProfile.id)
      : [];
    const accommodationInfo =
      await this.repository.getAccommodationTypeInfoById(
        hostProfile?.primary_accommodation_type_id ?? null
      );

    const hasAntiDiscrimination = policyAcceptances.some(
      (a) =>
        a.policy_type === 'ANTI_DISCRIMINATION' && a.policy_version === '2026.1'
    );
    const hasMaintenanceSla = policyAcceptances.some(
      (a) =>
        a.policy_type === 'MAINTENANCE_SLA' && a.policy_version === '2026.1'
    );

    return {
      userId,
      hostProfileId: hostProfile?.id ?? null,
      status: hostProfile?.status ?? 'NOT_STARTED',
      identity: {
        isSubmitted: Boolean(hostProfile?.identity_submitted_at),
        isVerified:
          hostProfile?.identity_verification_status === 'VERIFIED' &&
          Boolean(hostProfile?.identity_verified_at),
        verifiedAt: hostProfile?.identity_verified_at ?? null,
        reference: hostProfile?.identity_verification_ref ?? null,
      },
      payout: {
        isConfigured: Boolean(
          hostProfile?.bank_name || hostProfile?.bank_account_last4
        ),
        isVerified:
          hostProfile?.payout_verification_status === 'VERIFIED' &&
          Boolean(hostProfile?.payout_verified_at),
        bankName: hostProfile?.bank_name ?? null,
        accountLast4: hostProfile?.bank_account_last4 ?? null,
        verifiedAt: hostProfile?.payout_verified_at ?? null,
      },
      tax: {
        isRegistered: Boolean(
          hostProfile?.tax_id_last4 || hostProfile?.tax_profile_id
        ),
        isVerified:
          hostProfile?.tax_verification_status === 'VERIFIED' &&
          Boolean(hostProfile?.tax_verified_at),
        taxIdLast4: hostProfile?.tax_id_last4 ?? null,
        taxProfileId: hostProfile?.tax_profile_id ?? null,
        verifiedAt: hostProfile?.tax_verified_at ?? null,
      },
      specialization: {
        isSet: Boolean(hostProfile?.primary_accommodation_type_id),
        typeId: hostProfile?.primary_accommodation_type_id ?? null,
        slug: accommodationInfo.slug,
        name: accommodationInfo.name,
      },
      policies: {
        areAllCurrent: hasAntiDiscrimination && hasMaintenanceSla,
        acceptedCount: policyAcceptances.length,
      },
    };
  }

  /**
   * Evaluates complete publication eligibility for a host and listing context.
   */
  public async evaluatePublicationEligibility(
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
   * Submits identity KYC details for compliance verification.
   */
  public async submitIdentityKyc(
    userId: string,
    documentType: string,
    documentNumber: string,
    legalFullName: string
  ): Promise<void> {
    await this.repository.recordIdentityKycSubmission(
      userId,
      documentType,
      documentNumber,
      legalFullName
    );
  }

  /**
   * Records workspace payout account bank details.
   */
  public async savePayoutAccount(
    userId: string,
    bankName: string,
    accountNumber: string,
    ifscCode?: string,
    accountHolderName?: string
  ): Promise<void> {
    await this.repository.recordPayoutInstrument(
      userId,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName
    );
  }

  /**
   * Records tax registration identifier.
   */
  public async saveTaxRegistration(
    userId: string,
    taxIdType: 'PAN' | 'GSTIN',
    taxId: string
  ): Promise<void> {
    await this.repository.recordTaxRegistration(userId, taxIdType, taxId);
  }
}
