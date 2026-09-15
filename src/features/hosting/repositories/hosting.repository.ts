import { createClient } from '@/lib/supabase/server';
import {
  HostProfileRow,
  HostPolicyAcceptanceRow,
  HostPolicyType,
  UserIdentityContext,
} from '../types/hosting.types';

/**
 * Pure persistence layer for the Hosting Bounded Context and Host Profile entity.
 * Strictly adheres to the Repository Rule: returns raw row models and invokes controlled RPCs.
 */
export class HostingRepository {
  /**
   * Retrieves a host profile by user ID. Returns null if not started.
   */
  public async getHostProfileByUserId(
    userId: string
  ): Promise<HostProfileRow | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[HostingRepository] Error fetching host profile:', error);
      return null;
    }

    return data as unknown as HostProfileRow | null;
  }

  /**
   * Retrieves basic user profile context from public.profiles and active session for identity audit.
   */
  public async getUserIdentityContext(
    userId: string
  ): Promise<UserIdentityContext | null> {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();
    const email = authData.user?.email ?? null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, phone, avatar_storage_path')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.error('[HostingRepository] Error fetching user profile:', error);
      return {
        id: userId,
        email,
        displayName: null,
        fullName: null,
        phone: null,
        avatarStoragePath: null,
      };
    }

    return {
      id: userId,
      email,
      displayName: profile.display_name ?? null,
      fullName: profile.full_name ?? null,
      phone: profile.phone ?? null,
      avatarStoragePath: profile.avatar_storage_path ?? null,
    };
  }

  /**
   * Retrieves all policy acceptances recorded for a host profile.
   */
  public async getPolicyAcceptances(
    hostProfileId: string
  ): Promise<HostPolicyAcceptanceRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('host_policy_acceptances')
      .select('*')
      .eq('host_profile_id', hostProfileId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(
        '[HostingRepository] Error fetching policy acceptances:',
        error
      );
      return [];
    }

    return (data as unknown as HostPolicyAcceptanceRow[]) || [];
  }

  /**
   * Controlled RPC: Initializes a host profile record in ONBOARDING state for the authenticated caller.
   */
  public async initializeHostOnboarding(): Promise<HostProfileRow> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('initialize_host_onboarding');

    if (error || !data || data.success === false) {
      throw new Error(
        `Failed to initialize onboarding host profile: ${error?.message || data?.error || 'Unknown error'}`
      );
    }

    const profile = await this.getHostProfileByUserId(
      (await supabase.auth.getUser()).data.user?.id || ''
    );
    if (!profile) {
      throw new Error('Host profile initialized but failed to retrieve record');
    }
    return profile;
  }

  /**
   * Records identity submission facts and updates public profile basic metadata.
   */
  public async recordIdentitySubmission(
    userId: string,
    fullName: string,
    phone: string
  ): Promise<void> {
    const supabase = await createClient();

    // 1. Update basic profile info in public.profiles
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // 2. Record submission timestamp on host_profiles (note: verification status remains UNVERIFIED until audited)
    const { error } = await supabase
      .from('host_profiles')
      .update({
        identity_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // If direct update fails due to restricted column privileges, ignore or log appropriately
    if (error && error.code !== '42501') {
      console.warn(
        '[HostingRepository] Note on identity submission recording:',
        error.message
      );
    }
  }

  /**
   * Records identity KYC verification submission.
   */
  public async recordIdentityKycSubmission(
    userId: string,
    documentType: string,
    documentNumber: string,
    legalFullName: string
  ): Promise<void> {
    const supabase = await createClient();
    const last4 =
      documentNumber.length > 4 ? documentNumber.slice(-4) : documentNumber;
    const ref = `${documentType}-${last4}`;

    // 1. Update full legal name in profiles
    await supabase
      .from('profiles')
      .update({
        full_name: legalFullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // 2. Update host profile KYC facts
    const { error } = await supabase
      .from('host_profiles')
      .update({
        identity_submitted_at: new Date().toISOString(),
        identity_verification_ref: ref,
        identity_verification_status: 'PENDING',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error && error.code !== '42501') {
      console.warn('[HostingRepository] Note on KYC recording:', error.message);
    }
  }

  /**
   * Records payout bank account information.
   */
  public async recordPayoutInstrument(
    userId: string,
    bankName: string,
    accountNumberOrLast4: string,
    _ifscCode?: string,
    _accountHolderName?: string
  ): Promise<void> {
    const supabase = await createClient();
    const last4 =
      accountNumberOrLast4.length > 4
        ? accountNumberOrLast4.slice(-4)
        : accountNumberOrLast4;

    const { error } = await supabase
      .from('host_profiles')
      .update({
        bank_name: bankName,
        bank_account_last4: last4,
        payout_verification_status: 'PENDING',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error && error.code !== '42501') {
      console.warn(
        '[HostingRepository] Note on payout instrument recording:',
        error.message
      );
    }
  }

  /**
   * Records statutory tax registration (PAN / GSTIN).
   */
  public async recordTaxRegistration(
    userId: string,
    taxIdType: string,
    taxId: string
  ): Promise<void> {
    const supabase = await createClient();
    const last4 = taxId.length > 4 ? taxId.slice(-4) : taxId;

    const { error } = await supabase
      .from('host_profiles')
      .update({
        tax_id_type: taxIdType,
        tax_id_last4: last4,
        tax_verification_status: 'PENDING',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error && error.code !== '42501') {
      console.warn(
        '[HostingRepository] Note on tax registration recording:',
        error.message
      );
    }
  }

  /**
   * Sets accommodation specialization for a host entity if not locked.
   */
  public async setAccommodationSpecialization(
    userId: string,
    accommodationTypeId: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('host_profiles')
      .update({
        primary_accommodation_type_id: accommodationTypeId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error && error.code !== '42501') {
      console.warn(
        '[HostingRepository] Note on specialization recording:',
        error.message
      );
    }
  }

  /**
   * Updates host presentation fields (support phone, support email).
   */
  public async updatePresentationDetails(
    userId: string,
    supportPhone: string | null,
    supportEmail: string | null
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('host_profiles')
      .update({
        support_phone: supportPhone,
        support_email: supportEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(
        `Failed to update presentation details: ${error.message}`
      );
    }
  }

  /**
   * Controlled RPC: Appends an immutable policy acceptance record.
   */
  public async recordPolicyAcceptance(
    policyType: HostPolicyType,
    policyVersion: string,
    clientContext: Record<string, unknown> = {}
  ): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      'record_host_policy_acceptance',
      {
        p_policy_type: policyType,
        p_policy_version: policyVersion,
        p_client_context: clientContext,
      }
    );

    if (error || !data || data.success === false) {
      throw new Error(
        `Failed to record policy acceptance: ${error?.message || data?.error || 'Unknown error'}`
      );
    }

    return data.acceptanceId as string;
  }

  /**
   * Controlled RPC: Transitions a host profile from ONBOARDING to READY.
   */
  public async transitionHostToReady(): Promise<{
    success: boolean;
    status?: string;
    error?: string;
    missing?: string[];
  }> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('transition_host_to_ready');

    if (error) {
      throw new Error(
        `Failed to execute readiness transition: ${error.message}`
      );
    }

    return data as {
      success: boolean;
      status?: string;
      error?: string;
      missing?: string[];
    };
  }

  /**
   * Controlled RPC: Transitions a host profile from READY to ACTIVE upon first listing publication.
   */
  public async transitionHostToActive(): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('transition_host_to_active');

    if (error) {
      throw new Error(`Failed to activate host status: ${error.message}`);
    }

    return data as { success: boolean; status?: string; error?: string };
  }

  /**
   * Controlled RPC: Toggles operational status between ACTIVE and PAUSED.
   */
  public async transitionHostOperationalStatus(
    status: 'ACTIVE' | 'PAUSED'
  ): Promise<{ success: boolean; status?: string; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      'transition_host_operational_status',
      {
        p_status: status,
      }
    );

    if (error) {
      throw new Error(`Failed to update operational status: ${error.message}`);
    }

    return data as { success: boolean; status?: string; error?: string };
  }

  /**
   * Retrieves the accommodation type UUID for a given canonical slug ('pg', 'hostel', 'apartment', 'other').
   */
  public async getAccommodationTypeIdBySlug(
    slug: string
  ): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accommodation_types')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.error(
        '[HostingRepository] Error resolving accommodation type slug:',
        error
      );
      return null;
    }
    return (data as unknown as { id: string }).id;
  }

  /**
   * Retrieves the slug and display name for an accommodation type UUID.
   */
  public async getAccommodationTypeInfoById(
    id: string | null
  ): Promise<{ slug: string | null; name: string }> {
    if (!id) return { slug: null, name: 'Not designated' };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accommodation_types')
      .select('slug, name')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return { slug: null, name: 'Not designated' };
    }
    const record = data as unknown as {
      slug: string | null;
      name: string | null;
    };
    return {
      slug: record.slug ?? null,
      name: record.name ?? 'Specialized Accommodation',
    };
  }
}
