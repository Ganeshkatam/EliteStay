/*
==================================================
Domain: Host Stay & Resident Operations - Operations Policy
Purpose: Classifies stays into urgency-ordered queues, calculates Resident Health scores, and computes operational SLAs.
==================================================
*/

import {
  type EnrichedStayRow,
  type StayQueueType,
  StayPriority,
  type ResidentHealthBreakdown,
  type ResidentHealthScore,
} from '../types/stay.types';

export class StayOperationsPolicy {
  /**
   * Classifies stay records into urgency-ordered operational queues per Refinement #5.
   * Order of importance: check-ins -> departures -> current-residents -> past-stays.
   */
  public static getOperationalQueue(
    row: EnrichedStayRow,
    referenceDate: Date = new Date()
  ): StayQueueType {
    if (['checked_out', 'completed', 'terminated'].includes(row.status)) {
      return 'past-stays';
    }

    if (row.status === 'upcoming') {
      return 'check-ins';
    }

    // Active or extended residency evaluations
    const moveOut = new Date(row.expected_move_out_date);
    const daysUntilDeparture =
      (moveOut.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeparture <= 7) {
      return 'departures';
    }

    return 'current-residents';
  }

  /**
   * Calculates overall Resident Health score and itemized contributors per Refinements #4 & #10.
   */
  public static getResidentHealth(
    row: EnrichedStayRow,
    referenceDate: Date = new Date()
  ): ResidentHealthBreakdown {
    if (['checked_out', 'completed', 'terminated'].includes(row.status)) {
      return {
        occupancy: 'Tenancy concluded',
        payments: 'Settled',
        maintenance: 'No active maintenance',
        communication: 'Inactive',
        lease: 'Expired or terminated',
        overall: 'EXCELLENT',
      };
    }

    const moveOut = new Date(row.expected_move_out_date);
    const daysUntilDeparture = Math.ceil(
      (moveOut.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let leaseState = `Lease expires in ${daysUntilDeparture} days`;
    let overall: ResidentHealthScore = 'EXCELLENT';
    let actionRequired: string | undefined;

    if (daysUntilDeparture <= 3 && daysUntilDeparture >= 0) {
      leaseState = 'Immediate lease expiry / Move-out impending';
      overall = 'CRITICAL';
      actionRequired =
        'Conduct check-out inspection and settle security deposit';
    } else if (daysUntilDeparture <= 14) {
      leaseState = 'Lease upcoming expiration';
      overall = 'NEEDS_ATTENTION';
      actionRequired = 'Initiate lease renewal or departure scheduling';
    }

    return {
      occupancy:
        row.status === 'extended'
          ? 'Lease extended resident'
          : 'Active resident in accommodation',
      payments: `₹${Number(row.agreed_amount || 0).toLocaleString()} ${row.agreed_billing_period || 'monthly'} paid`,
      maintenance: 'All resident requests resolved',
      communication: 'In routine contact',
      lease: leaseState,
      overall,
      actionRequired,
    };
  }

  /**
   * Computes operational priority severity per queue urgency and SLA countdowns.
   */
  public static getStayPriority(
    row: EnrichedStayRow,
    referenceDate: Date = new Date()
  ): StayPriority {
    const queue = this.getOperationalQueue(row, referenceDate);
    if (queue === 'past-stays') {
      return StayPriority.NONE;
    }

    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    if (queue === 'check-ins') {
      const moveIn = new Date(row.expected_move_in_date);
      moveIn.setHours(0, 0, 0, 0);
      const diffDays =
        (moveIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays <= 0) return StayPriority.CRITICAL; // Overdue or arriving today!
      if (diffDays <= 3) return StayPriority.HIGH;
      return StayPriority.NORMAL;
    }

    if (queue === 'departures') {
      const moveOut = new Date(row.expected_move_out_date);
      moveOut.setHours(0, 0, 0, 0);
      const diffDays =
        (moveOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays <= 0) return StayPriority.CRITICAL; // Overdue checkout or leaving today!
      if (diffDays <= 3) return StayPriority.HIGH;
      return StayPriority.NORMAL;
    }

    // current-residents queue checks Resident Health
    const health = this.getResidentHealth(row, referenceDate);
    if (health.overall === 'CRITICAL') return StayPriority.CRITICAL;
    if (health.overall === 'NEEDS_ATTENTION') return StayPriority.HIGH;
    return StayPriority.LOW;
  }

  /**
   * Determines operational attention SLA timestamp without UI string coupling.
   */
  public static getAttentionDeadline(
    row: EnrichedStayRow,
    referenceDate: Date = new Date()
  ): string | null {
    const queue = this.getOperationalQueue(row, referenceDate);
    if (queue === 'check-ins') {
      return row.expected_move_in_date;
    }
    if (queue === 'departures' || queue === 'current-residents') {
      return row.expected_move_out_date;
    }
    return null;
  }

  /**
   * Sorts stay rows by urgency severity and date SLA proximity.
   */
  public static sortStaysByPriority(
    rows: EnrichedStayRow[],
    referenceDate: Date = new Date()
  ): EnrichedStayRow[] {
    const severityMap: Record<StayPriority, number> = {
      [StayPriority.CRITICAL]: 4,
      [StayPriority.HIGH]: 3,
      [StayPriority.NORMAL]: 2,
      [StayPriority.LOW]: 1,
      [StayPriority.NONE]: 0,
    };

    return [...rows].sort((a, b) => {
      const pA = this.getStayPriority(a, referenceDate);
      const pB = this.getStayPriority(b, referenceDate);
      const diff = severityMap[pB] - severityMap[pA];
      if (diff !== 0) return diff;

      // Tie-break by target date proximity
      const dateA = new Date(a.expected_move_in_date).getTime();
      const dateB = new Date(b.expected_move_in_date).getTime();
      return dateA - dateB;
    });
  }
}
