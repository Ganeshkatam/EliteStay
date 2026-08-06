/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { ResidentViewModel } from './resident-view-model.types';
import { observeService } from '@/lib/observability/decorators/observe-service';

export class ResidentViewModelFactory {
  static async createForTenant(tenantId: string): Promise<ResidentViewModel> {
    return observeService(
      'ResidentViewModelFactory',
      'createForTenant',
      async () => {
        const supabase = await createClient();

        // Find the most recent active or relevant lease for the tenant
        const { data: leases, error } = await supabase
          .from('leases')
          .select(
            `
          id,
          status,
          start_date,
          end_date,
          monthly_rent_amount,
          security_deposit_amount,
          structured_data,
          booking:reservation_id (
            listing:listing_id (
              id,
              title,
              address,
              host:host_id (
                raw_user_meta_data
              )
            )
          ),
          security_deposit:security_deposits(*),
          move_in:move_ins(*)
        `
          )
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          throw new Error(`Failed to fetch resident lease: ${error.message}`);
        }

        if (!leases || leases.length === 0) {
          return {
            lease: null,
            property: null,
            deposit: null,
            moveIn: null,
          };
        }

        const row = leases[0] as Record<string, any>;
        const listing = row.booking?.listing;
        const hostMeta = listing?.host?.raw_user_meta_data || {};
        const hostName =
          `${hostMeta.first_name || ''} ${hostMeta.last_name || ''}`.trim() ||
          'Your Host';

        return {
          lease: {
            id: row.id,
            status: row.status,
            startDate: row.start_date,
            endDate: row.end_date,
            monthlyRentAmount: Number(row.monthly_rent_amount),
            securityDepositAmount: Number(row.security_deposit_amount),
          },
          property: listing
            ? {
                id: listing.id,
                title: listing.title,
                address: listing.address,
                hostName,
                houseRules: row.structured_data?.houseRules || [],
                specialConditions: row.structured_data?.specialConditions || [],
                utilitiesIncluded: row.structured_data?.utilitiesIncluded || [],
              }
            : null,
          deposit: row.security_deposit?.[0]
            ? {
                id: row.security_deposit[0].id,
                leaseId: row.security_deposit[0].lease_id,
                amount: Number(row.security_deposit[0].amount),
                status: row.security_deposit[0].status,
                collectedAt: row.security_deposit[0].collected_at,
                releasedAt: row.security_deposit[0].released_at,
                releaseReason: row.security_deposit[0].release_reason,
                createdAt: row.security_deposit[0].created_at,
                updatedAt: row.security_deposit[0].updated_at,
              }
            : null,
          moveIn: row.move_in?.[0]
            ? {
                id: row.move_in[0].id,
                leaseId: row.move_in[0].lease_id,
                status: row.move_in[0].status,
                scheduledDate: row.move_in[0].scheduled_date,
                depositVerified: row.move_in[0].deposit_verified,
                identityVerified: row.move_in[0].identity_verified,
                keysIssued: row.move_in[0].keys_issued,
                conditionReportSigned: row.move_in[0].condition_report_signed,
                inventoryCompleted: row.move_in[0].inventory_completed,
                utilityInformationShared:
                  row.move_in[0].utility_information_shared,
                emergencyContactsConfirmed:
                  row.move_in[0].emergency_contacts_confirmed,
                completedAt: row.move_in[0].completed_at,
                createdAt: row.move_in[0].created_at,
                updatedAt: row.move_in[0].updated_at,
              }
            : null,
        };
      }
    );
  }
}
