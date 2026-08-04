import React from 'react';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import {
  StayOperationsService,
  StayOperationsWorkspace,
  type StayQueueType,
} from '@/features/host/stays';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Thin Route Component for Host Stay & Resident Operations Workspace (Phase 7).
 * Strictly orchestrates authentication and invokes domain services without inline business logic or SQL queries.
 */
export default async function HostStaysPage({ searchParams }: PageProps) {
  const { user } = await HostAccessService.requireOperationalHost();

  const params = searchParams ? await searchParams : {};
  const activeQueueParam =
    typeof params.queue === 'string'
      ? (params.queue as StayQueueType)
      : 'current-residents';
  const validQueues: StayQueueType[] = [
    'check-ins',
    'departures',
    'current-residents',
    'past-stays',
  ];
  const activeQueue = validQueues.includes(activeQueueParam)
    ? activeQueueParam
    : 'current-residents';

  const viewModel = await StayOperationsService.getWorkspaceViewModel(
    user.id,
    activeQueue
  );

  return <StayOperationsWorkspace viewModel={viewModel} />;
}
