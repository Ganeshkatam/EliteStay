import { observeService } from '@/lib/observability';
import { recordBusinessEvent } from '@/lib/observability/events/business-events';
import { HostSettingsRepository } from '../repositories/host-settings.repository';
import { HostSettingsViewModel } from '../view-models/settings.viewmodels';
import {
  HostSettingsRow,
  UpdateLocalizationCommand,
  UpdateCommunicationCommand,
  UpdateAutomationCommand,
  UpdateNotificationsCommand,
} from '../types/settings.types';

export class HostSettingsService {
  constructor(private readonly repository: HostSettingsRepository) {}

  /**
   * Retrieves the settings for a host profile. Initializes defaults if missing.
   */
  async getSettings(hostProfileId: string): Promise<HostSettingsViewModel> {
    return observeService('HostSettingsService', 'getSettings', async () => {
      const row = await this.repository.getOrUpsertSettings(hostProfileId);
      return this.mapToViewModel(row);
    });
  }

  async updateLocalization(
    command: UpdateLocalizationCommand
  ): Promise<HostSettingsViewModel> {
    return observeService(
      'HostSettingsService',
      'updateLocalization',
      async () => {
        const updates: Partial<HostSettingsRow> = {};
        if (command.language !== undefined) updates.language = command.language;
        if (command.timezone !== undefined) updates.timezone = command.timezone;
        if (command.currency !== undefined) updates.currency = command.currency;
        if (command.weekStartDay !== undefined)
          updates.week_start_day = command.weekStartDay;

        const row = await this.repository.updateSettings(
          command.hostProfileId,
          updates
        );

        recordBusinessEvent(
          'HOST_LOCALIZATION_UPDATED',
          { domain: 'hosting', entityId: command.hostProfileId },
          updates
        );

        return this.mapToViewModel(row);
      }
    );
  }

  async updateCommunication(
    command: UpdateCommunicationCommand
  ): Promise<HostSettingsViewModel> {
    return observeService(
      'HostSettingsService',
      'updateCommunication',
      async () => {
        const updates: Partial<HostSettingsRow> = {};
        if (command.showProfilePublicly !== undefined)
          updates.show_profile_publicly = command.showProfilePublicly;
        if (command.allowDirectMessages !== undefined)
          updates.allow_direct_messages = command.allowDirectMessages;

        const row = await this.repository.updateSettings(
          command.hostProfileId,
          updates
        );

        recordBusinessEvent(
          'HOST_SETTINGS_UPDATED',
          { domain: 'hosting', entityId: command.hostProfileId },
          { component: 'communication', ...updates }
        );

        return this.mapToViewModel(row);
      }
    );
  }

  async updateAutomation(
    command: UpdateAutomationCommand
  ): Promise<HostSettingsViewModel> {
    return observeService(
      'HostSettingsService',
      'updateAutomation',
      async () => {
        const updates: Partial<HostSettingsRow> = {};
        if (command.autoAcceptBookingRequests !== undefined)
          updates.auto_accept_booking_requests =
            command.autoAcceptBookingRequests;

        const row = await this.repository.updateSettings(
          command.hostProfileId,
          updates
        );

        recordBusinessEvent(
          'HOST_SETTINGS_UPDATED',
          { domain: 'hosting', entityId: command.hostProfileId },
          { component: 'automation', ...updates }
        );

        return this.mapToViewModel(row);
      }
    );
  }

  async updateNotifications(
    command: UpdateNotificationsCommand
  ): Promise<HostSettingsViewModel> {
    return observeService(
      'HostSettingsService',
      'updateNotifications',
      async () => {
        const updates: Partial<HostSettingsRow> = {};
        if (command.notifyEmailBookings !== undefined)
          updates.notify_email_bookings = command.notifyEmailBookings;
        if (command.notifyPushBookings !== undefined)
          updates.notify_push_bookings = command.notifyPushBookings;
        if (command.notifySmsBookings !== undefined)
          updates.notify_sms_bookings = command.notifySmsBookings;

        if (command.notifyEmailMessages !== undefined)
          updates.notify_email_messages = command.notifyEmailMessages;
        if (command.notifyPushMessages !== undefined)
          updates.notify_push_messages = command.notifyPushMessages;

        if (command.notifyEmailSystem !== undefined)
          updates.notify_email_system = command.notifyEmailSystem;
        if (command.notifyPushSystem !== undefined)
          updates.notify_push_system = command.notifyPushSystem;

        if (command.notifyEmailMarketing !== undefined)
          updates.notify_email_marketing = command.notifyEmailMarketing;
        if (command.notifyPushMarketing !== undefined)
          updates.notify_push_marketing = command.notifyPushMarketing;

        const row = await this.repository.updateSettings(
          command.hostProfileId,
          updates
        );

        recordBusinessEvent(
          'HOST_NOTIFICATION_PREFERENCES_UPDATED',
          { domain: 'hosting', entityId: command.hostProfileId },
          updates
        );

        return this.mapToViewModel(row);
      }
    );
  }

  private mapToViewModel(row: HostSettingsRow): HostSettingsViewModel {
    return {
      hostProfileId: row.host_profile_id,
      localization: {
        language: row.language,
        timezone: row.timezone,
        currency: row.currency,
        weekStartDay: row.week_start_day,
      },
      communication: {
        showProfilePublicly: row.show_profile_publicly,
        allowDirectMessages: row.allow_direct_messages,
      },
      automation: {
        autoAcceptBookingRequests: row.auto_accept_booking_requests,
      },
      notifications: {
        bookings: {
          email: row.notify_email_bookings,
          push: row.notify_push_bookings,
          sms: row.notify_sms_bookings,
        },
        messages: {
          email: row.notify_email_messages,
          push: row.notify_push_messages,
        },
        system: {
          email: row.notify_email_system,
          push: row.notify_push_system,
        },
        marketing: {
          email: row.notify_email_marketing,
          push: row.notify_push_marketing,
        },
      },
      preferences: row.preferences,
    };
  }
}
