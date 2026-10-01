import { RentalApplication } from '../types/application.types';
import { ApplicationRepository } from '../repositories/application.repository';
import { ApplicationLifecyclePolicy } from '../domain/lifecycle.policy';
import { OutboxRepository } from '@/lib/events/outbox-repository';
import { DomainEventType } from '@/lib/events/domain-events';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, host_id')
      .eq('id', app.propertyId)
      .single();

    if (listingError || !listing || listing.host_id !== hostId) {
      throw new Error('Unauthorized: Host does not own this property');
    }

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

    const supabase = await createClient();
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, host_id')
      .eq('id', app.propertyId)
      .single();

    if (listingError || !listing || listing.host_id !== hostId) {
      throw new Error('Unauthorized: Host does not own this property');
    }

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
