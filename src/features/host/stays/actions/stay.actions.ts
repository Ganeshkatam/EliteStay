'use server';

/*
==================================================
Domain: Host Stay & Resident Operations - Server Actions
Purpose: Next.js Server Actions invoking atomic state transition RPCs and triggering route cache invalidations.
==================================================
*/

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { type DatabaseStayStatus } from '../types/stay.types';
import { StayRepository } from '../repositories/stay.repository';
import { StayLifecyclePolicy } from '../policies/StayLifecyclePolicy';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Executes arrival check-in confirmation, transitioning stay to active status via atomic RPC.
 */
export async function confirmCheckInAction(
  stayId: string,
  currentStatus: DatabaseStayStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized user session.' };
  }

  const validation = StayLifecyclePolicy.canTransitionTo(
    currentStatus,
    'active'
  );
  if (!validation.allowed) {
    return { success: false, error: validation.reason };
  }

  const todayIso = new Date().toISOString().split('T')[0];
  const result = await StayRepository.transitionStay(
    supabase,
    stayId,
    currentStatus,
    'active',
    user.id,
    { actual_move_in_date: todayIso },
    { note: 'Confirmed arrival check-in via Host Stay Operations Workspace' }
  );

  if (result.success) {
    revalidatePath('/host/stays');
    revalidatePath('/host');
  }

  return result;
}

/**
 * Executes move-out departure confirmation, transitioning stay to checked_out status.
 */
export async function confirmCheckOutAction(
  stayId: string,
  currentStatus: DatabaseStayStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized user session.' };
  }

  const validation = StayLifecyclePolicy.canTransitionTo(
    currentStatus,
    'checked_out'
  );
  if (!validation.allowed) {
    return { success: false, error: validation.reason };
  }

  const todayIso = new Date().toISOString().split('T')[0];
  const result = await StayRepository.transitionStay(
    supabase,
    stayId,
    currentStatus,
    'checked_out',
    user.id,
    { actual_move_out_date: todayIso },
    { note: 'Confirmed move-out departure via Host Stay Operations Workspace' }
  );

  if (result.success) {
    revalidatePath('/host/stays');
    revalidatePath('/host');
  }

  return result;
}

/**
 * Executes tenancy lease extension status updates.
 */
export async function extendLeaseAction(
  stayId: string,
  currentStatus: DatabaseStayStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized user session.' };
  }

  const validation = StayLifecyclePolicy.canTransitionTo(
    currentStatus,
    'extended'
  );
  if (!validation.allowed) {
    return { success: false, error: validation.reason };
  }

  const result = await StayRepository.transitionStay(
    supabase,
    stayId,
    currentStatus,
    'extended',
    user.id,
    {},
    { note: 'Lease agreement extended by host' }
  );

  if (result.success) {
    revalidatePath('/host/stays');
    revalidatePath('/host');
  }

  return result;
}

/**
 * Executes early termination of residential stay.
 */
export async function terminateStayAction(
  stayId: string,
  currentStatus: DatabaseStayStatus,
  reason?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized user session.' };
  }

  const validation = StayLifecyclePolicy.canTransitionTo(
    currentStatus,
    'terminated'
  );
  if (!validation.allowed) {
    return { success: false, error: validation.reason };
  }

  const todayIso = new Date().toISOString().split('T')[0];
  const result = await StayRepository.transitionStay(
    supabase,
    stayId,
    currentStatus,
    'terminated',
    user.id,
    { actual_move_out_date: todayIso },
    {
      note: 'Early termination applied',
      reason: reason || 'Host administrative termination',
    }
  );

  if (result.success) {
    revalidatePath('/host/stays');
    revalidatePath('/host');
  }

  return result;
}
