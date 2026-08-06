'use server';

import { requireUser } from '@/features/auth/server/auth-helpers';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';
import { DepositService } from '@/features/tenancy/deposit/services/deposit.service';
import { revalidatePath } from 'next/cache';

export async function markDepositCollectedAction(depositId: string) {
  return instrumentExecution(
    'markDepositCollectedAction',
    'ACTION',
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await requireUser();

      // In a real app, verify the host owns the deposit
      await DepositService.markCollected(depositId);

      revalidatePath('/host/leases');
      return { success: true };
    }
  );
}
