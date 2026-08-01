import { SupabaseClient } from '@supabase/supabase-js';

export type StayStatus = 'upcoming' | 'active' | 'extended' | 'checked_out' | 'completed' | 'terminated';

const VALID_STAY_TRANSITIONS: Record<StayStatus, StayStatus[]> = {
  upcoming: ['active', 'terminated'],
  active: ['checked_out', 'extended', 'terminated'],
  extended: ['checked_out', 'terminated'],
  checked_out: ['completed'],
  completed: [],
  terminated: [],
};

export async function logStayEvent(
  supabase: SupabaseClient,
  stayId: string,
  action: string,
  actorId: string,
  metadata: any = {}
) {
  const { error } = await supabase.from('stay_events').insert({
    stay_id: stayId,
    action,
    actor_id: actorId,
    metadata,
  });
  if (error) {
    console.error(`Failed to log stay event ${action}:`, error);
  }
}

export async function transitionStay(
  stayId: string,
  newStatus: StayStatus,
  actorId: string,
  supabase: SupabaseClient,
  updates: Record<string, unknown> = {},
  metadata: any = {}
) {
  const { data: stay, error: fetchError } = await supabase
    .from('stays')
    .select('status')
    .eq('id', stayId)
    .single();

  if (fetchError || !stay) {
    return { error: 'Stay not found.' };
  }

  const currentStatus = stay.status as StayStatus;

  if (!VALID_STAY_TRANSITIONS[currentStatus].includes(newStatus)) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}.` };
  }

  const { data: updatedStay, error: updateError } = await supabase.rpc('transition_stay', {
    p_stay_id: stayId,
    p_current_status: currentStatus,
    p_new_status: newStatus,
    p_actor_id: actorId,
    p_updates: updates,
    p_metadata: metadata
  });

  if (updateError || !updatedStay || !updatedStay.success) {
    console.error('RPC transition_stay failed:', updateError);
    return { error: 'Stay state changed by another process. Please refresh.' };
  }

  return { success: true, stay: { ...stay, status: newStatus, ...updates } };
}
