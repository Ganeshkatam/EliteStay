'use server';

import { requireUser } from '@/features/auth/server/auth-helpers';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';
import { LeaseService } from '@/features/tenancy/lease/services/lease.service';
import { revalidatePath } from 'next/cache';

export async function issueLeaseAction(leaseId: string) {
  return instrumentExecution('issueLeaseAction', 'ACTION', async () => {
    const user = await requireUser();

    // In a real app, verify the host owns the lease via the booking/property
    await LeaseService.issueLease(leaseId, user.id);

    revalidatePath('/host/leases');
    return { success: true };
  });
}
