/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { HostLeaseViewModel } from './lease-view-model.types';
import { observeService } from '@/lib/observability/decorators/observe-service';

export class HostLeaseViewModelFactory {
  static async createForHost(hostId: string): Promise<HostLeaseViewModel[]> {
    return observeService(
      'HostLeaseViewModelFactory',
      'createForHost',
      async () => {
        const supabase = await createClient();

        // We need to fetch leases associated with the host's properties
        // Since leases are tied to reservations, and reservations to properties, we join them.

        const { data, error } = await supabase
          .from('leases')
          .select(
            `
          id,
          status,
          start_date,
          end_date,
          monthly_rent_amount,
          security_deposit_amount,
          created_at,
          tenant_id,
          tenant:tenant_id (
            id,
            raw_user_meta_data
          ),
          booking:reservation_id (
            listing:listing_id (
              id,
              title,
              address
            )
          ),
          security_deposit:security_deposits(*),
          move_in:move_ins(*)
        `
          )
          .eq('booking.listing.host_id', hostId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch host leases: ${error.message}`);
        }

        // Filter out nulls from the left join eq if necessary (Supabase sometimes returns records with null relations if the eq doesn't match on the relation)
        const validData = data.filter(
          (row: unknown) =>
            (row as Record<string, any>).booking &&
            (row as Record<string, any>).booking.listing
        );

        return validData.map((_row: unknown): HostLeaseViewModel => {
          const row = _row as Record<string, any>;
          const listing = row.booking.listing;
          // Construct the tenant name from user metadata
          const meta = row.tenant?.raw_user_meta_data || {};
          const tenantName =
            `${meta.first_name || ''} ${meta.last_name || ''}`.trim() ||
            'Unknown Tenant';

          return {
            id: row.id,
            status: row.status,

            propertyId: listing.id,
            propertyTitle: listing.title,
            propertyAddress: listing.address,

            tenantId: row.tenant_id,
            tenantName,
            tenantEmail: meta.email || '', // Depending on where email is stored (auth.users isn't directly joinable sometimes, but metadata might have it)

            startDate: row.start_date,
            endDate: row.end_date,
            monthlyRentAmount: Number(row.monthly_rent_amount),
            securityDepositAmount: Number(row.security_deposit_amount),

            securityDeposit: row.security_deposit?.[0]
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

            createdAt: row.created_at,
          };
        });
      }
    );
  }
}
