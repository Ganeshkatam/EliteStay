/*
==================================================
Domain: Host Stay & Resident Operations - ViewModels
Purpose: Composes presentation-ready ViewModel contracts for residential stay cards without exposing raw database entities.
==================================================
*/

import {
  type EnrichedStayRow,
  type StayQueueType,
  type StayPriority,
  type StayLifecycleState,
  type ResidentHealthBreakdown,
  type StayAction,
  type ResidentSummary,
  type ListingSummary,
  type DatabaseStayStatus,
} from '../types/stay.types';
import { StayLifecyclePolicy } from '../policies/StayLifecyclePolicy';
import { StayOperationsPolicy } from '../policies/StayOperationsPolicy';
import { StayDecisionPolicy } from '../policies/StayDecisionPolicy';

export interface StayCardViewModel {
  id: string;
  databaseStatus: DatabaseStayStatus;
  resident: ResidentSummary;
  listing: ListingSummary;
  queue: StayQueueType;
  priority: StayPriority;
  lifecycleState: StayLifecycleState;
  health: ResidentHealthBreakdown;
  attentionDeadline: string | null;
  actions: StayAction[];
}

/**
 * Factory function composing immutable card ViewModels from raw persistence records and domain policies.
 */
export function composeStayCardViewModel(
  row: EnrichedStayRow,
  referenceDate: Date = new Date()
): StayCardViewModel {
  const queue = StayOperationsPolicy.getOperationalQueue(row, referenceDate);
  const priority = StayOperationsPolicy.getStayPriority(row, referenceDate);
  const lifecycleState = StayLifecyclePolicy.getLifecycleState(
    row,
    referenceDate
  );
  const health = StayOperationsPolicy.getResidentHealth(row, referenceDate);
  const attentionDeadline = StayOperationsPolicy.getAttentionDeadline(
    row,
    referenceDate
  );
  const actions = StayDecisionPolicy.getAvailableActions(row);

  let occupancyState: ResidentSummary['occupancyState'] = 'FORMER';
  if (row.status === 'upcoming') {
    occupancyState = 'CHECKING_IN';
  } else if (['active', 'extended'].includes(row.status)) {
    occupancyState = queue === 'departures' ? 'CHECKING_OUT' : 'ACTIVE';
  }

  const resident: ResidentSummary = {
    id: row.guest_id,
    fullName: row.guest_name,
    avatarUrl: row.guest_avatar,
    email: row.guest_email,
    phone: row.guest_phone,
    stayId: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    moveInDate: row.actual_move_in_date || row.expected_move_in_date,
    moveOutDate: row.actual_move_out_date || row.expected_move_out_date,
    occupancyState,
  };

  const listing: ListingSummary = {
    id: row.listing_id,
    title: row.listing_title,
    city: row.listing_city,
    slug: row.listing_slug,
    monthlyRent: Number(row.agreed_amount || 0),
    securityDeposit: Number(row.security_deposit_paid || 0),
  };

  return {
    id: row.id,
    databaseStatus: row.status,
    resident,
    listing,
    queue,
    priority,
    lifecycleState,
    health,
    attentionDeadline,
    actions,
  };
}
