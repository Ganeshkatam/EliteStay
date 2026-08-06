import { createClient } from '@/lib/supabase/server';
import { MoveIn, MoveInStatus } from '../types/move-in.types';

/**
 * Maps camelCase checklist field names to snake_case DB column names.
 */
const FIELD_TO_COLUMN: Record<string, string> = {
  depositVerified: 'deposit_verified',
  identityVerified: 'identity_verified',
  keysIssued: 'keys_issued',
  conditionReportSigned: 'condition_report_signed',
  inventoryCompleted: 'inventory_completed',
  utilityInformationShared: 'utility_information_shared',
  emergencyContactsConfirmed: 'emergency_contacts_confirmed',
};

export class MoveInRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToMoveIn(row: any): MoveIn {
    return {
      id: row.id,
      leaseId: row.lease_id,
      status: row.status,
      scheduledDate: row.scheduled_date,
      depositVerified: row.deposit_verified,
      identityVerified: row.identity_verified,
      keysIssued: row.keys_issued,
      conditionReportSigned: row.condition_report_signed,
      inventoryCompleted: row.inventory_completed,
      utilityInformationShared: row.utility_information_shared,
      emergencyContactsConfirmed: row.emergency_contacts_confirmed,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async getById(id: string): Promise<MoveIn | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('move_ins')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToMoveIn(data);
  }

  static async getByLeaseId(leaseId: string): Promise<MoveIn | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('move_ins')
      .select('*')
      .eq('lease_id', leaseId)
      .single();

    if (error || !data) return null;
    return this.mapToMoveIn(data);
  }

  static async create(
    leaseId: string,
    scheduledDate?: string
  ): Promise<MoveIn> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('move_ins')
      .insert({
        lease_id: leaseId,
        status: 'PENDING',
        scheduled_date: scheduledDate || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create move-in: ${error.message}`);
    return this.mapToMoveIn(data);
  }

  static async updateStatus(id: string, status: MoveInStatus): Promise<void> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { status };
    if (status === 'COMPLETED') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('move_ins')
      .update(updates)
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update move-in status: ${error.message}`);
  }

  static async updateChecklistField(
    id: string,
    field: string,
    value: boolean
  ): Promise<void> {
    const column = FIELD_TO_COLUMN[field];
    if (!column) throw new Error(`Unknown checklist field: ${field}`);

    const supabase = await createClient();
    const { error } = await supabase
      .from('move_ins')
      .update({ [column]: value })
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update move-in checklist: ${error.message}`);
  }

  static async schedule(id: string, scheduledDate: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('move_ins')
      .update({ scheduled_date: scheduledDate, status: 'SCHEDULED' })
      .eq('id', id);

    if (error) throw new Error(`Failed to schedule move-in: ${error.message}`);
  }
}
