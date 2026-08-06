import { createClient } from '@/lib/supabase/server';
import { SecurityDeposit, SecurityDepositStatus } from '../types/deposit.types';

export class DepositRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToDeposit(row: any): SecurityDeposit {
    return {
      id: row.id,
      leaseId: row.lease_id,
      amount: Number(row.amount),
      status: row.status,
      collectedAt: row.collected_at,
      releasedAt: row.released_at,
      releaseReason: row.release_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async getById(id: string): Promise<SecurityDeposit | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('security_deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToDeposit(data);
  }

  static async getByLeaseId(leaseId: string): Promise<SecurityDeposit | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('security_deposits')
      .select('*')
      .eq('lease_id', leaseId)
      .single();

    if (error || !data) return null;
    return this.mapToDeposit(data);
  }

  static async create(
    leaseId: string,
    amount: number
  ): Promise<SecurityDeposit> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('security_deposits')
      .insert({
        lease_id: leaseId,
        amount,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create security deposit: ${error.message}`);
    return this.mapToDeposit(data);
  }

  static async updateStatus(
    id: string,
    status: SecurityDepositStatus,
    additionalFields?: {
      collected_at?: string;
      released_at?: string;
      release_reason?: string;
    }
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('security_deposits')
      .update({ status, ...additionalFields })
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update deposit status: ${error.message}`);
  }
}
