/*
==================================================
Domain: Host Stay & Resident Operations - Workspace ViewModel
Purpose: Aggregates operational queue definitions, resident health KPIs, and card ViewModels for the Stays workspace.
==================================================
*/

import {
  type EnrichedStayRow,
  type StayQueueType,
  StayPriority,
  type StayQueueDefinition,
} from '../types/stay.types';
import { StayOperationsPolicy } from '../policies/StayOperationsPolicy';
import {
  type StayCardViewModel,
  composeStayCardViewModel,
} from './stay-card.viewmodel';

/**
 * Unified KPI summary contract per Refinement #9.
 * Exposes a clean summary object so UI rendering becomes trivial and decoupled from database computation.
 */
export interface StayWorkspaceSummary {
  checkInsToday: number;
  activeResidents: number;
  departuresToday: number;
  departuresThisWeek: number;
  criticalResidents: number;
  pastStaysCount: number;
}

export interface StayWorkspaceViewModel {
  activeQueue: StayQueueType;
  summary: StayWorkspaceSummary;
  queues: StayQueueDefinition[];
  cards: StayCardViewModel[];
  totalStaysCount: number;
  lastUpdatedIso: string;
}

/**
 * Master workspace ViewModel assembly factory per Operational Workspace Rule.
 */
export function composeStayWorkspaceViewModel(
  rows: EnrichedStayRow[],
  activeQueue: StayQueueType = 'current-residents',
  referenceDate: Date = new Date()
): StayWorkspaceViewModel {
  // 1. Sort rows by priority and date SLA proximity
  const sortedRows = StayOperationsPolicy.sortStaysByPriority(
    rows,
    referenceDate
  );

  // 2. Classify rows into urgency-ordered queues and compute summary KPIs
  let checkInsToday = 0;
  let activeResidents = 0;
  let departuresToday = 0;
  let departuresThisWeek = 0;
  let criticalResidents = 0;
  let pastStaysCount = 0;

  const queueCounts: Record<StayQueueType, number> = {
    'check-ins': 0,
    departures: 0,
    'current-residents': 0,
    'past-stays': 0,
  };

  const queueHighestPriority: Record<StayQueueType, StayPriority> = {
    'check-ins': StayPriority.NONE,
    departures: StayPriority.NONE,
    'current-residents': StayPriority.NONE,
    'past-stays': StayPriority.NONE,
  };

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const updatePriority = (queue: StayQueueType, p: StayPriority) => {
    const weights: Record<StayPriority, number> = {
      [StayPriority.CRITICAL]: 4,
      [StayPriority.HIGH]: 3,
      [StayPriority.NORMAL]: 2,
      [StayPriority.LOW]: 1,
      [StayPriority.NONE]: 0,
    };
    if (weights[p] > weights[queueHighestPriority[queue]]) {
      queueHighestPriority[queue] = p;
    }
  };

  for (const row of sortedRows) {
    const q = StayOperationsPolicy.getOperationalQueue(row, referenceDate);
    const p = StayOperationsPolicy.getStayPriority(row, referenceDate);
    queueCounts[q] = (queueCounts[q] || 0) + 1;
    updatePriority(q, p);

    if (q === 'check-ins') {
      const moveIn = new Date(row.expected_move_in_date);
      moveIn.setHours(0, 0, 0, 0);
      const diffDays = Math.abs(
        (moveIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 1) checkInsToday++;
    } else if (q === 'departures' || q === 'current-residents') {
      activeResidents++;
      const health = StayOperationsPolicy.getResidentHealth(row, referenceDate);
      if (health.overall === 'CRITICAL' || p === StayPriority.CRITICAL) {
        criticalResidents++;
      }

      if (q === 'departures') {
        const moveOut = new Date(row.expected_move_out_date);
        moveOut.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
          (moveOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 1 && diffDays >= -7) departuresToday++;
        if (diffDays <= 7 && diffDays >= -7) departuresThisWeek++;
      }
    } else if (q === 'past-stays') {
      pastStaysCount++;
    }
  }

  // 3. Compose queues sorted by urgency per Refinements #1, #2, & #5
  const queues: StayQueueDefinition[] = [
    {
      id: 'check-ins',
      label: 'Check-ins',
      count: queueCounts['check-ins'] || 0,
      priority: queueHighestPriority['check-ins'],
    },
    {
      id: 'departures',
      label: 'Departures',
      count: queueCounts['departures'] || 0,
      priority: queueHighestPriority['departures'],
    },
    {
      id: 'current-residents',
      label: 'Current Residents',
      count: queueCounts['current-residents'] || 0,
      priority: queueHighestPriority['current-residents'],
    },
    {
      id: 'past-stays',
      label: 'Past Stays',
      count: queueCounts['past-stays'] || 0,
      priority: queueHighestPriority['past-stays'],
    },
  ];

  // 4. Filter rows belonging to active queue and generate Card ViewModels
  const activeRows = sortedRows.filter(
    (row) =>
      StayOperationsPolicy.getOperationalQueue(row, referenceDate) ===
      activeQueue
  );
  const cards = activeRows.map((r) =>
    composeStayCardViewModel(r, referenceDate)
  );

  return {
    activeQueue,
    summary: {
      checkInsToday,
      activeResidents,
      departuresToday,
      departuresThisWeek,
      criticalResidents,
      pastStaysCount,
    },
    queues,
    cards,
    totalStaysCount: rows.length,
    lastUpdatedIso: new Date().toISOString(),
  };
}
