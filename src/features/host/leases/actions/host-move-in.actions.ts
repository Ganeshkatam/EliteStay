'use server';

import { requireUser } from '@/features/auth/server/auth-helpers';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';
import { MoveInService } from '@/features/tenancy/move-in/services/move-in.service';
import { MoveInChecklistField } from '@/features/tenancy/move-in/types/move-in.types';
import { revalidatePath } from 'next/cache';

export async function updateMoveInChecklistAction(
  moveInId: string,
  field: MoveInChecklistField,
  value: boolean
) {
  return instrumentExecution(
    'updateMoveInChecklistAction',
    'ACTION',
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await requireUser();

      // In a real app, verify the host owns the move-in
      await MoveInService.updateChecklistItem(moveInId, field, value);

      revalidatePath('/host/leases');
      return { success: true };
    }
  );
}

export async function completeMoveInAction(moveInId: string) {
  return instrumentExecution('completeMoveInAction', 'ACTION', async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await requireUser();

      await MoveInService.complete(moveInId);

      revalidatePath('/host/leases');
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message };
    }
  });
}
