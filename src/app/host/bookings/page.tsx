import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { BookingOperationsService } from '@/features/host/bookings/services/booking-operations.service';
import { BookingOperationsWorkspace } from '@/features/host/bookings/components/BookingOperationsWorkspace';
import { type OperationalQueueType } from '@/features/host/bookings/types/booking.types';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Thin Route Component for Host Booking Operations Workspace.
 * Strictly orchestrates authentication and invokes domain services without inline business logic or SQL queries.
 */
export default async function HostBookingsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const params = searchParams ? await searchParams : {};
  const activeQueueParam =
    typeof params.queue === 'string'
      ? (params.queue as OperationalQueueType)
      : 'needs-attention';
  const validQueues: OperationalQueueType[] = [
    'needs-attention',
    'today-move-ins',
    'upcoming',
    'closed',
  ];
  const activeQueue = validQueues.includes(activeQueueParam)
    ? activeQueueParam
    : 'needs-attention';

  const viewModel = await BookingOperationsService.getWorkspaceViewModel(
    supabase,
    user.id,
    activeQueue
  );

  return <BookingOperationsWorkspace viewModel={viewModel} />;
}
