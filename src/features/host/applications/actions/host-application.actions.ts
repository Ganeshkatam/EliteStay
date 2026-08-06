'use server';

import { HostApplicationService } from '../services/host-application.service';
import { requireUser } from '@/features/auth/server/auth-helpers';
import { revalidatePath } from 'next/cache';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';

export async function getHostApplicationsAction() {
  return instrumentExecution(
    'getHostApplicationsAction',
    'ACTION',
    async () => {
      const user = await requireUser();
      return await HostApplicationService.getDashboard(user.id);
    }
  );
}

export async function approveApplicationAction(applicationId: string) {
  return instrumentExecution('approveApplicationAction', 'ACTION', async () => {
    const user = await requireUser();
    await HostApplicationService.approveApplication(applicationId, user.id);

    // Revalidate the host dashboard
    revalidatePath('/host/applications');
    return { success: true };
  });
}

export async function rejectApplicationAction(applicationId: string) {
  return instrumentExecution('rejectApplicationAction', 'ACTION', async () => {
    const user = await requireUser();
    await HostApplicationService.rejectApplication(applicationId, user.id);

    // Revalidate the host dashboard
    revalidatePath('/host/applications');
    return { success: true };
  });
}
