import { createClient } from '@/lib/supabase/server';
import {
  Lease,
  LeaseStatus,
  LeaseVersion,
  LeaseVersionChangeReason,
} from '../types/lease.types';

export class LeaseRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToLease(row: any): Lease {
    return {
      id: row.id,
      reservationId: row.reservation_id,
      tenantId: row.tenant_id,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      monthlyRentAmount: Number(row.monthly_rent_amount),
      securityDepositAmount: Number(row.security_deposit_amount),
      structuredData: row.structured_data,
      documentUrl: row.document_url,
      currentVersionId: row.current_version_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToVersion(row: any): LeaseVersion {
    return {
      id: row.id,
      leaseId: row.lease_id,
      versionNumber: row.version_number,
      startDate: row.start_date,
      endDate: row.end_date,
      monthlyRentAmount: Number(row.monthly_rent_amount),
      securityDepositAmount: Number(row.security_deposit_amount),
      structuredData: row.structured_data,
      changeReason: row.change_reason,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }

  static async getById(id: string): Promise<Lease | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToLease(data);
  }

  static async getByReservationId(
    reservationId: string
  ): Promise<Lease | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('reservation_id', reservationId)
      .single();

    if (error || !data) return null;
    return this.mapToLease(data);
  }

  static async getByTenantId(tenantId: string): Promise<Lease[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row) => this.mapToLease(row));
  }

  static async create(
    lease: Omit<
      Lease,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentVersionId'
    >
  ): Promise<Lease> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leases')
      .insert({
        reservation_id: lease.reservationId,
        tenant_id: lease.tenantId,
        start_date: lease.startDate,
        end_date: lease.endDate,
        monthly_rent_amount: lease.monthlyRentAmount,
        security_deposit_amount: lease.securityDepositAmount,
        structured_data: lease.structuredData,
        document_url: lease.documentUrl,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create lease: ${error.message}`);
    return this.mapToLease(data);
  }

  static async updateStatus(id: string, status: LeaseStatus): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('leases')
      .update({ status })
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update lease status: ${error.message}`);
  }

  static async updateDocument(id: string, documentUrl: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('leases')
      .update({ document_url: documentUrl })
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update lease document: ${error.message}`);
  }

  // ── Versioning ──

  static async createVersion(
    leaseId: string,
    lease: Lease,
    changeReason: LeaseVersionChangeReason,
    createdBy: string | null
  ): Promise<LeaseVersion> {
    const supabase = await createClient();

    // Determine the next version number
    const { data: existing } = await supabase
      .from('lease_versions')
      .select('version_number')
      .eq('lease_id', leaseId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion =
      existing && existing.length > 0 ? existing[0].version_number + 1 : 1;

    const { data, error } = await supabase
      .from('lease_versions')
      .insert({
        lease_id: leaseId,
        version_number: nextVersion,
        start_date: lease.startDate,
        end_date: lease.endDate,
        monthly_rent_amount: lease.monthlyRentAmount,
        security_deposit_amount: lease.securityDepositAmount,
        structured_data: lease.structuredData,
        change_reason: changeReason,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create lease version: ${error.message}`);

    // Update the lease to point to this version
    await supabase
      .from('leases')
      .update({ current_version_id: data.id })
      .eq('id', leaseId);

    return this.mapToVersion(data);
  }

  static async getVersions(leaseId: string): Promise<LeaseVersion[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lease_versions')
      .select('*')
      .eq('lease_id', leaseId)
      .order('version_number', { ascending: true });

    if (error || !data) return [];
    return data.map((row) => this.mapToVersion(row));
  }
}
