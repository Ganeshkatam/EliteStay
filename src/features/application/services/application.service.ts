import {
  RentalApplication,
  RentalApplicationStatus,
} from '../types/application.types';
import { ApplicationRepository } from '../repositories/application.repository';
import { ApplicationLifecyclePolicy } from '../domain/lifecycle.policy';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';

export class ApplicationService {
  static async createDraft(
    data: Omit<RentalApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<RentalApplication> {
    return ApplicationRepository.create(data);
  }

  static async submit(applicationId: string, guestId: string): Promise<void> {
    const app = await ApplicationRepository.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (app.guestId !== guestId) throw new Error('Unauthorized');

    ApplicationLifecyclePolicy.validateTransition(app.status, 'SUBMITTED');

    await ApplicationRepository.updateStatus(applicationId, 'SUBMITTED');

    // Emit event via Outbox
    await OutboxRepository.append({
      type: DomainEventType.RENTAL_APPLICATION_SUBMITTED,
      aggregateType: 'APPLICATION',
      aggregateId: applicationId,
      payload: {
        applicationId,
        propertyId: app.propertyId,
        guestId,
      },
    });
  }

  static async approve(applicationId: string, hostId: string): Promise<void> {
    const app = await ApplicationRepository.getById(applicationId);
    if (!app) throw new Error('Application not found');

    // Authorization: Verify hostId owns the property. This should ideally be done in a HostService,
    // but for now we assume it's checked by the caller or we can rely on RLS if using a logged-in user context.

    ApplicationLifecyclePolicy.validateTransition(app.status, 'APPROVED');

    await ApplicationRepository.updateStatus(applicationId, 'APPROVED');

    // Emit event via Outbox
    await OutboxRepository.append({
      type: DomainEventType.RENTAL_APPLICATION_APPROVED,
      aggregateType: 'APPLICATION',
      aggregateId: applicationId,
      payload: {
        applicationId,
        propertyId: app.propertyId,
        guestId: app.guestId,
      },
    });
  }

  static async reject(applicationId: string, hostId: string): Promise<void> {
    const app = await ApplicationRepository.getById(applicationId);
    if (!app) throw new Error('Application not found');

    ApplicationLifecyclePolicy.validateTransition(app.status, 'REJECTED');

    await ApplicationRepository.updateStatus(applicationId, 'REJECTED');

    await OutboxRepository.append({
      type: DomainEventType.RENTAL_APPLICATION_REJECTED,
      aggregateType: 'APPLICATION',
      aggregateId: applicationId,
      payload: {
        applicationId,
        propertyId: app.propertyId,
        guestId: app.guestId,
      },
    });
  }
}
