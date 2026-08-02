export type TimelineEventType =
  | 'move_in'
  | 'move_out'
  | 'maintenance'
  | 'pending_booking'
  | 'availability_opens';

export interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  listingId: string;
  listingTitle: string;
  title: string;
  subtitle?: string;
  status?: string;
  actionHref?: string;
  actionText?: string;
  isUrgent?: boolean;
  priority: 'urgent' | 'normal' | 'informational';
}

export interface HostTimelineViewModel {
  today: TimelineEvent[];
  tomorrow: TimelineEvent[];
  thisWeek: TimelineEvent[];
  upcoming: TimelineEvent[];
}

// Data shapes for fetching
export interface TimelineListing {
  id: string;
  title: string | null;
}

export interface TimelineStay {
  id: string;
  listing_id: string;
  expected_move_in_date: string;
  expected_move_out_date: string;
  status: string;
  guest_profiles?: { full_name: string | null } | null;
}

export interface TimelineBooking {
  id: string;
  listing_id: string;
  requested_move_in: string;
  requested_duration: number;
  status: string;
  guest_profiles?: { full_name: string | null } | null;
}

export interface TimelineAvailability {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  status: string;
  source: string;
}
