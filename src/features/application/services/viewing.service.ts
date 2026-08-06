import { ViewingRequestRepository } from '../repositories/viewing-request.repository';
import { ViewingRequest, ViewingRequestStatus } from '../types/viewing.types';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';

export class ViewingService {
  static async requestViewing(
    data: Omit<ViewingRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ViewingRequest> {
    const request = await ViewingRequestRepository.create(data);

    await OutboxRepository.append({
      type: DomainEventType.VIEWING_REQUESTED,
      aggregateType: 'VIEWING',
      aggregateId: request.id,
      payload: {
        viewingRequestId: request.id,
        propertyId: request.propertyId,
        guestId: request.guestId,
      },
    });

    return request;
  }

  static async confirmViewing(requestId: string): Promise<void> {
    await ViewingRequestRepository.updateStatus(requestId, 'CONFIRMED');

    await OutboxRepository.append({
      type: DomainEventType.VIEWING_CONFIRMED,
      aggregateType: 'VIEWING',
      aggregateId: requestId,
      payload: {
        viewingRequestId: requestId,
      },
    });
  }
}
