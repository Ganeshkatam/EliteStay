'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HostingService } from '../services/hosting.service';
import { HostProfileService } from '../services/host-profile.service';
import { createDraftListing } from '@/features/host/actions/listing-actions';

const hostingService = new HostingService();
const profileService = new HostProfileService();

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

/**
 * Initializes hosting capability onboarding from the marketing landing page (/host/start).
 */
export async function startHostingAction() {
  const user = await getAuthenticatedUser();
  await hostingService.initializeOnboarding(user.id);

  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/identity');
}

/**
 * Submits verified identity details (Step 1) and navigates to bank setup.
 */
export async function submitIdentityStepAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const fullName = String(formData.get('fullName') || '');
  const phone = String(formData.get('phone') || '');

  if (!fullName || !phone) {
    throw new Error('Full name and verified phone number are required');
  }

  await hostingService.submitIdentityStep(user.id, fullName, phone);
  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/bank');
}

/**
 * Submits payout bank account details (Step 2) and navigates to business configuration.
 */
export async function submitBankStepAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const bankName = String(formData.get('bankName') || '');
  const accountNumber = String(formData.get('accountNumber') || '');

  if (!bankName || !accountNumber) {
    throw new Error('Bank name and account details are required');
  }

  await hostingService.submitBankStep(user.id, bankName, accountNumber);
  revalidatePath('/host/onboarding', 'layout');
  redirect('/host/onboarding/policies');
}

/**
 * Confirms SLA agreements (Step 4), promotes status to READY, and navigates to completion screen.
 */
export async function submitPoliciesStepAction() {
  const user = await getAuthenticatedUser();
  await hostingService.submitPoliciesStep(user.id);
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
 * Concludes hosting onboarding by invoking the publishing workspace draft creator.
 */
export async function launchFirstListingAction() {
  await getAuthenticatedUser();
  // Call established listing builder server action
  await createDraftListing();
}

/**
 * Updates permanent Host Profile settings in /host/profile.
 */
export async function updateHostProfileSettingsAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const primaryAccommodationSlug = String(
    formData.get('primaryAccommodationSlug') || ''
  );
  const supportPhone = String(formData.get('supportPhone') || '');
  const supportEmail = String(formData.get('supportEmail') || '');
  const bankName = String(formData.get('bankName') || '');
  const accountLast4 = String(formData.get('accountLast4') || '');

  await profileService.updateHostDetails(
    user.id,
    supportPhone,
    supportEmail,
    primaryAccommodationSlug
  );

  if (bankName || accountLast4) {
    await profileService.updatePayoutDetails(user.id, bankName, accountLast4);
  }

  revalidatePath('/host/profile');
  revalidatePath('/host');
}

/**
 * Toggles operational hosting capabilities between ACTIVE and PAUSED.
 */
export async function toggleHostOperationalStatusAction(
  newStatus: 'ACTIVE' | 'PAUSED'
) {
  const user = await getAuthenticatedUser();
  await profileService.toggleOperationalStatus(user.id, newStatus);

  revalidatePath('/host/profile');
  revalidatePath('/host');
}
