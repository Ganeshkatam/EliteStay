'use server';

import { createClient } from '@/lib/supabase/server';
import { HostSettingsRepository } from '../repositories/host-settings.repository';
import { HostSettingsService } from '../services/host-settings.service';
import {
  UpdateLocalizationCommand,
  UpdateCommunicationCommand,
  UpdateAutomationCommand,
  UpdateNotificationsCommand,
} from '../types/settings.types';
import { HostSettingsViewModel } from '../view-models/settings.viewmodels';
import { instrumentExecution } from '@/lib/observability';

async function getService() {
  const supabase = await createClient();
  const repo = new HostSettingsRepository(supabase);
  return new HostSettingsService(repo);
}

export async function getHostSettings(
  hostProfileId: string
): Promise<HostSettingsViewModel> {
  return instrumentExecution('getHostSettings', 'ACTION', async () => {
    return await (await getService()).getSettings(hostProfileId);
  });
}

export async function updateHostLocalization(
  command: UpdateLocalizationCommand
): Promise<HostSettingsViewModel> {
  return instrumentExecution('updateHostLocalization', 'ACTION', async () => {
    return await (await getService()).updateLocalization(command);
  });
}

export async function updateHostCommunication(
  command: UpdateCommunicationCommand
): Promise<HostSettingsViewModel> {
  return instrumentExecution('updateHostCommunication', 'ACTION', async () => {
    return await (await getService()).updateCommunication(command);
  });
}

export async function updateHostAutomation(
  command: UpdateAutomationCommand
): Promise<HostSettingsViewModel> {
  return instrumentExecution('updateHostAutomation', 'ACTION', async () => {
    return await (await getService()).updateAutomation(command);
  });
}

export async function updateHostNotifications(
  command: UpdateNotificationsCommand
): Promise<HostSettingsViewModel> {
  return instrumentExecution('updateHostNotifications', 'ACTION', async () => {
    return await (await getService()).updateNotifications(command);
  });
}
