'use server';

import { ViewingService } from '../services/viewing.service';
import { requireUser } from '@/features/auth/server/auth-helpers';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';

export async function submitViewingRequestAction(data: {
  propertyId: string;
  requestedDate: string;
  requestedTime: string;
  message: string | null;
}) {
  return instrumentExecution(
    'submitViewingRequestAction',
    'ACTION',
    async () => {
      const user = await requireUser();

      await ViewingService.requestViewing({
        propertyId: data.propertyId,
        guestId: user.id,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        message: data.message,
      });

      return { success: true };
    }
  );
}
