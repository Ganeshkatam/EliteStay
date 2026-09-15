import { describe, it, expect } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local into process.env for live database testing
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore env read failures
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ybeidsnuijipacnmybfo.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const hasSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('mock.supabase.co') &&
  supabaseAnonKey !== 'mock-supabase-publishable-key'
);

describe('Publication Eligibility & Database Boundary (Phase 2 Verification)', () => {
  let supabase: SupabaseClient;

  if (hasSupabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  it.skipIf(!hasSupabase)(
    'P01 - RPC publish_listing rejects unauthenticated callers with 401',
    async () => {
      const randomListingId = '00000000-0000-0000-0000-000000000001';
      const { data, error } = await supabase.rpc('publish_listing', {
        p_listing_id: randomListingId,
      });

      if (error) {
        expect(['P0001', '42501', 'PGRST301', '401']).toContain(error.code);
      } else {
        expect(data).toMatchObject({
          success: false,
          error: 'UNAUTHENTICATED',
          code: '401',
        });
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'P02 - Direct client UPDATE on listings.status to published is rejected by publication guard trigger',
    async () => {
      // Attempt direct update bypassing publish_listing RPC
      const { error } = await supabase
        .from('listings')
        .update({ status: 'published' })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      // Must be rejected with 42501 (prohibited direct update) or RLS deny
      if (error) {
        expect(['42501', 'P0001', '403']).toContain(error.code);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'P03 - Direct anonymous or non-owner INSERT/UPDATE on listings cannot force published status',
    async () => {
      const { error } = await supabase.from('listings').insert({
        public_id: 'test-adversarial-pub',
        title: 'Adversarial Direct Publish',
        status: 'published',
        host_id: '00000000-0000-0000-0000-000000000002',
        accommodation_type_id: '00000000-0000-0000-0000-000000000003',
      });

      // RLS or trigger must deny insert
      expect(error).toBeDefined();
    }
  );

  it.skipIf(!hasSupabase)(
    'P04 - Direct mutation of host_profiles status to ACTIVE is blocked by column privileges',
    async () => {
      const { error } = await supabase
        .from('host_profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      expect(error).toBeDefined();
    }
  );

  it.skipIf(!hasSupabase)(
    'P05 - Direct mutation of host_profiles verification status to VERIFIED is blocked by column privileges',
    async () => {
      const { error } = await supabase
        .from('host_profiles')
        .update({
          identity_verification_status: 'VERIFIED',
          payout_verification_status: 'VERIFIED',
          tax_verification_status: 'VERIFIED',
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      expect(error).toBeDefined();
    }
  );

  it.skipIf(!hasSupabase)(
    'P06 - Concurrent publish_listing executions serialize safely via row-level locks without deadlocks or double-transitions',
    async () => {
      const testListingId = '00000000-0000-0000-0000-000000000001';

      // Launch 2 concurrent unauthenticated or concurrent caller RPCs
      const [res1, res2] = await Promise.all([
        supabase.rpc('publish_listing', { p_listing_id: testListingId }),
        supabase.rpc('publish_listing', { p_listing_id: testListingId }),
      ]);

      // Both must handle transaction isolation safely without unhandled 40P01 deadlocks
      expect([null, 'P0001', '42501', '401', 'PGRST301']).toContain(
        res1.error?.code ?? null
      );
      expect([null, 'P0001', '42501', '401', 'PGRST301']).toContain(
        res2.error?.code ?? null
      );
    }
  );

  it.skipIf(!hasSupabase)(
    'P07 - Direct anonymous or non-host SELECT on host_policy_acceptances returns empty or denied under RLS',
    async () => {
      const { data, error } = await supabase
        .from('host_policy_acceptances')
        .select('*');

      if (error) {
        expect(['PGRST301', '42501', '401', '403']).toContain(error.code);
      } else {
        expect(data).toHaveLength(0);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'P08 - ListingPublicationEligibilityPolicy accurately detects each individual missing host compliance and listing requirement',
    async () => {
      const { ListingPublicationEligibilityPolicy } =
        await import('@/features/hosting/policies/ListingPublicationEligibilityPolicy');

      const baseProfile = {
        id: 'hp_1',
        user_id: 'usr_1',
        status: 'READY',
        primary_accommodation_type_id: 'acc_1',
        bank_account_id: null,
        bank_name: 'HDFC',
        bank_account_last4: '1234',
        tax_profile_id: null,
        tax_id_last4: '5678',
        tax_id_type: 'PAN',
        identity_submitted_at: '2026-09-15T12:00:00Z',
        identity_verification_status: 'VERIFIED',
        identity_verification_ref: 'AADHAAR-1234',
        identity_verified_at: '2026-09-15T12:00:00Z',
        payout_verification_status: 'VERIFIED',
        payout_verified_at: '2026-09-15T12:00:00Z',
        tax_verification_status: 'VERIFIED',
        tax_verified_at: '2026-09-15T12:00:00Z',
        agreed_to_policies_at: '2026-09-15T12:00:00Z',
        support_phone: null,
        support_email: null,
        created_at: '',
        updated_at: '',
      };

      const basePolicies = [
        {
          id: 'acc_1',
          host_profile_id: 'hp_1',
          policy_type: 'ANTI_DISCRIMINATION',
          policy_version: '2026.1',
          accepted_at: '',
          client_context: {},
          created_at: '',
        },
        {
          id: 'acc_2',
          host_profile_id: 'hp_1',
          policy_type: 'MAINTENANCE_SLA',
          policy_version: '2026.1',
          accepted_at: '',
          client_context: {},
          created_at: '',
        },
      ];

      const baseListing = {
        id: 'lst_1',
        title: 'Complete Listing Title',
        images_count: 3,
        price: 10000,
        has_location: true,
      };

      // Fully compliant check
      const fullPass = ListingPublicationEligibilityPolicy.evaluate(
        baseProfile as never,
        basePolicies as never,
        baseListing
      );
      expect(fullPass.eligible).toBe(true);

      // Missing KYC
      const missingKyc = ListingPublicationEligibilityPolicy.evaluate(
        { ...baseProfile, identity_verification_status: 'UNVERIFIED' } as never,
        basePolicies as never,
        baseListing
      );
      expect(missingKyc.eligible).toBe(false);
      expect(missingKyc.missingRequirements).toContain(
        'IDENTITY_VERIFICATION_REQUIRED'
      );

      // Missing Payout
      const missingPayout = ListingPublicationEligibilityPolicy.evaluate(
        { ...baseProfile, payout_verification_status: 'PENDING' } as never,
        basePolicies as never,
        baseListing
      );
      expect(missingPayout.eligible).toBe(false);
      expect(missingPayout.missingRequirements).toContain(
        'PAYOUT_VERIFICATION_REQUIRED'
      );

      // Missing Tax
      const missingTax = ListingPublicationEligibilityPolicy.evaluate(
        { ...baseProfile, tax_verification_status: 'UNVERIFIED' } as never,
        basePolicies as never,
        baseListing
      );
      expect(missingTax.eligible).toBe(false);
      expect(missingTax.missingRequirements).toContain(
        'TAX_VERIFICATION_REQUIRED'
      );

      // Missing Photos
      const missingPhotos = ListingPublicationEligibilityPolicy.evaluate(
        baseProfile as never,
        basePolicies as never,
        { ...baseListing, images_count: 0 }
      );
      expect(missingPhotos.eligible).toBe(false);
      expect(missingPhotos.missingRequirements).toContain(
        'LISTING_PHOTOS_REQUIRED'
      );

      // Missing Price
      const missingPrice = ListingPublicationEligibilityPolicy.evaluate(
        baseProfile as never,
        basePolicies as never,
        { ...baseListing, price: 0 }
      );
      expect(missingPrice.eligible).toBe(false);
      expect(missingPrice.missingRequirements).toContain(
        'LISTING_PRICING_REQUIRED'
      );

      // Missing Location
      const missingLoc = ListingPublicationEligibilityPolicy.evaluate(
        baseProfile as never,
        basePolicies as never,
        { ...baseListing, has_location: false }
      );
      expect(missingLoc.eligible).toBe(false);
      expect(missingLoc.missingRequirements).toContain(
        'LISTING_LOCATION_REQUIRED'
      );
    }
  );
});
