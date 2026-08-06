'use server';

import { requireUser } from '@/features/auth/server/auth-helpers';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';
import { LeaseService } from '@/features/tenancy/lease/services/lease.service';
import { revalidatePath } from 'next/cache';

export async function signLeaseAction(leaseId: string) {
  return instrumentExecution('signLeaseAction', 'ACTION', async () => {
    const user = await requireUser();

    await LeaseService.signLease(leaseId, user.id);

    revalidatePath('/resident');
    return { success: true };
  });
}
