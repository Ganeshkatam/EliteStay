'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HostingService } from '../services/hosting.service';
import { HostProfileService } from '../services/host-profile.service';
import { createDraftListing } from '@/features/host/actions/listing-actions';
import { HostComplianceService } from '../services/host-compliance.service';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';
import {
  IdentityStepSchema,
  SpecializationStepSchema,
  PolicyStepSchema,
  IdentityKycSubmissionSchema,
  PayoutAccountSchema,
  TaxRegistrationSchema,
  HostProfileSettingsSchema,
  OperationalStatusToggleSchema,
} from '../schemas/hosting.schemas';
import { AuditContext } from '../types/hosting.types';

const hostingService = new HostingService();
const complianceService = new HostComplianceService();
const profileService = new HostProfileService();

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return { user, supabase };
}

async function getAuditContext(): Promise<AuditContext> {
  const headerList = await headers();
  return {
    userAgent: headerList.get('user-agent'),
    ipAddress:
      headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || null,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Initializes hosting capability onboarding from the marketing landing page (/host/start).
 */
export async function startHostingAction() {
  await getAuthenticatedUser();
  await hostingService.initializeOnboarding();

  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/identity');
}

/**
 * Submits verified identity details (Step 1) and navigates to accommodation specialization (Step 2).
 */
export async function submitIdentityStepAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = IdentityStepSchema.parse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
  });

  await hostingService.submitIdentityStep(
    user.id,
    parsed.fullName,
    parsed.phone
  );

  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/specialization');
}

/**
 * Submits accommodation specialization selection (Step 2) and navigates to mandatory policies (Step 3).
 */
export async function submitSpecializationStepAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = SpecializationStepSchema.parse({
    primaryAccommodationSlug: formData.get('primaryAccommodationSlug'),
  });

  await hostingService.submitSpecializationStep(
    user.id,
    parsed.primaryAccommodationSlug
  );

  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/policies');
}

/**
 * Host Compliance Center Action: Submits identity KYC documents.
 * Persists submission facts and marks verification PENDING.
 */
export async function submitIdentityKycAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = IdentityKycSubmissionSchema.parse({
    documentType: formData.get('documentType'),
    documentNumber: formData.get('documentNumber'),
    legalFullName: formData.get('legalFullName'),
  });

  await complianceService.submitIdentityKyc(
    user.id,
    parsed.documentType,
    parsed.documentNumber,
    parsed.legalFullName
  );

  revalidatePath('/host/compliance');
  revalidatePath('/host/profile');
  revalidatePath('/host');
}

/**
 * Workspace Compliance Action: Saves payout bank details from within host workspace.
 * Does not alter or gate onboarding state.
 */
export async function savePayoutAccountAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = PayoutAccountSchema.parse({
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    ifscCode: formData.get('ifscCode') || undefined,
    accountHolderName: formData.get('accountHolderName') || undefined,
  });

  await complianceService.savePayoutAccount(
    user.id,
    parsed.bankName,
    parsed.accountNumber,
    parsed.ifscCode,
    parsed.accountHolderName
  );

  revalidatePath('/host/compliance');
  revalidatePath('/host/profile');
  revalidatePath('/host');
}

/**
 * Workspace Compliance Action: Saves tax registration details from within host workspace.
 * Does not alter or gate onboarding state.
 */
export async function saveTaxRegistrationAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = TaxRegistrationSchema.parse({
    taxIdType: formData.get('taxIdType') || 'PAN',
    taxId: formData.get('taxId'),
  });

  await complianceService.saveTaxRegistration(
    user.id,
    parsed.taxIdType,
    parsed.taxId
  );

  revalidatePath('/host/compliance');
  revalidatePath('/host/profile');
  revalidatePath('/host');
}

/**
 * Thin Route Action: Publishes a listing via transactional publish_listing RPC.
 */
export async function publishListingAction(listingId: string) {
  const { user, supabase } = await getAuthenticatedUser();

  await PublishingService.publish(supabase, listingId, user.id);

  revalidatePath('/s');
  revalidatePath('/host/listings');
  revalidatePath(`/host/listings/${listingId}`);
  revalidatePath(`/host/listings/${listingId}/build`);
}

/**
 * Legacy Step 2 alias / Backward compatibility: redirect or delegate to payout saving.
 */
export async function submitBankStepAction(formData: FormData) {
  return savePayoutAccountAction(formData);
}

/**
 * Confirms SLA agreements (Step 4), promotes status to READY, and navigates to completion screen.
 * Strictly validates checkbox agreements and ensures READY status was persisted before redirecting.
 */
export async function submitPoliciesStepAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  PolicyStepSchema.parse({
    agreeAntiDiscrimination: formData.get('agreeAntiDiscrimination'),
    agreeMaintenanceSla: formData.get('agreeMaintenanceSla'),
  });

  const auditContext = await getAuditContext();

  await hostingService.submitPoliciesStep(user.id, auditContext);
  const result = await hostingService.confirmReadyToHost(user.id);

  if (!result.success) {
    throw new Error(
      result.message ||
        'Host profile is not eligible to advance to READY status.'
    );
  }

  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/ready');
}

/**
 * Concludes hosting onboarding by creating the first draft listing.
 * Verifies that host has achieved READY or ACTIVE status before proceeding.
 */
export async function launchFirstListingAction() {
  const { user } = await getAuthenticatedUser();

  await hostingService.requireReadyOrActiveHost(user.id);
  await createDraftListing();
}

/**
 * Updates permanent Host Profile settings in /host/profile.
 */
export async function updateHostProfileSettingsAction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = HostProfileSettingsSchema.parse({
    primaryAccommodationSlug:
      formData.get('primaryAccommodationSlug') || undefined,
    supportPhone: formData.get('supportPhone') || undefined,
    supportEmail: formData.get('supportEmail') || undefined,
    bankName: formData.get('bankName') || undefined,
    accountLast4: formData.get('accountLast4') || undefined,
  });

  await profileService.updateHostDetails(
    user.id,
    parsed.supportPhone,
    parsed.supportEmail,
    parsed.primaryAccommodationSlug
  );

  if (parsed.bankName || parsed.accountLast4) {
    await profileService.updatePayoutDetails(
      user.id,
      parsed.bankName || '',
      parsed.accountLast4 || ''
    );
  }

  revalidatePath('/host/profile');
  revalidatePath('/host');
}

/**
 * Toggles operational hosting capabilities between ACTIVE and PAUSED.
 */
export async function toggleHostOperationalStatusAction(newStatus: unknown) {
  const { user } = await getAuthenticatedUser();
  const validStatus = OperationalStatusToggleSchema.parse(newStatus);

  await profileService.toggleOperationalStatus(user.id, validStatus);

  revalidatePath('/host/profile');
  revalidatePath('/host');
}
