/*
==================================================
Domain: Host Booking Operations - ViewModels
Purpose: Master workspace ViewModel composition, providing pre-computed summaries and queue classifications to satisfy the Operational Workspace Rule.
==================================================
*/

import {
  BookingPriority,
  type OperationalQueueType,
  type QueueDefinition,
  type EnrichedBookingRow,
} from '../types/booking.types';
import { BookingOperationsPolicy } from '../policies/BookingOperationsPolicy';
import {
  type BookingCardViewModel,
  createBookingCardViewModel,
} from './booking-card.viewmodel';

export interface BookingWorkspaceSummary {
  attention: number;
  todayMoveIns: number;
  upcoming: number;
  closed: number;
  criticalCount: number;
  highCount: number;
  normalCount: number;
}

export interface BookingWorkspaceViewModel {
  summary: BookingWorkspaceSummary;
  queues: QueueDefinition[];
  activeQueue: OperationalQueueType;
  items: BookingCardViewModel[];
}

/**
 * Orchestration factory to build the complete workspace ViewModel from repository rows.
 */
export function createBookingWorkspaceViewModel(
  rows: EnrichedBookingRow[],
  activeQueue: OperationalQueueType = 'needs-attention',
  referenceDate: Date = new Date()
): BookingWorkspaceViewModel {
  // 1. Sort rows by operational priority (CRITICAL -> HIGH -> NORMAL -> LOW -> NONE)
  const sortedRows = BookingOperationsPolicy.sortQueueByPriority(
    rows,
    referenceDate
  );

  // 2. Classify rows and compute queue totals
  let attention = 0;
  let todayMoveIns = 0;
  let upcoming = 0;
  let closed = 0;

  for (const row of sortedRows) {
    const q = BookingOperationsPolicy.getOperationalQueue(row, referenceDate);
    if (q === 'needs-attention') attention++;
    else if (q === 'today-move-ins') todayMoveIns++;
    else if (q === 'upcoming') upcoming++;
    else if (q === 'closed') closed++;
  }

  const breakdown = BookingOperationsPolicy.getAttentionBreakdown(
    sortedRows,
    referenceDate
  );

  const summary: BookingWorkspaceSummary = {
    attention,
    todayMoveIns,
    upcoming,
    closed,
    criticalCount: breakdown.criticalCount,
    highCount: breakdown.highCount,
    normalCount: breakdown.normalCount,
  };

  // 3. Compose dynamic queue tab definitions
  const queues: QueueDefinition[] = [
    {
      id: 'needs-attention',
      label: 'Needs Attention',
      count: attention,
      priority:
        breakdown.criticalCount > 0
          ? BookingPriority.CRITICAL
          : breakdown.highCount > 0
            ? BookingPriority.HIGH
            : BookingPriority.NORMAL,
    },
    {
      id: 'today-move-ins',
      label: "Today's Move-ins",
      count: todayMoveIns,
      priority:
        todayMoveIns > 0 ? BookingPriority.HIGH : BookingPriority.NORMAL,
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      count: upcoming,
      priority: BookingPriority.LOW,
    },
    {
      id: 'closed',
      label: 'Closed',
      count: closed,
      priority: BookingPriority.NONE,
    },
  ];

  // 4. Map only rows matching the active queue into card ViewModels
  const items: BookingCardViewModel[] = sortedRows
    .filter(
      (r) =>
        BookingOperationsPolicy.getOperationalQueue(r, referenceDate) ===
        activeQueue
    )
    .map((r) => createBookingCardViewModel(r, referenceDate));

  return {
    summary,
    queues,
    activeQueue,
    items,
  };
}
