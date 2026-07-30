// src/features/bookings/utils/transitions.ts
import { Database } from '@/types/supabase';

export type BookingStatus = Database['public']['Enums']['booking_status'];
export type StayStatus = Database['public']['Enums']['stay_status'];
export type ActorRole = Database['public']['Enums']['user_role'];

type BookingTransitionMatrix = {
  [from in BookingStatus]?: {
    [to in BookingStatus]?: ActorRole[];
  };
};

type StayTransitionMatrix = {
  [from in StayStatus]?: {
    [to in StayStatus]?: ActorRole[];
  };
};

const bookingTransitions: BookingTransitionMatrix = {
  pending: {
    approved: ['host', 'admin'],
    rejected: ['host', 'admin'],
    cancelled: ['guest', 'host', 'admin'],
    expired: ['admin'], // system or admin
  },
};

const stayTransitions: StayTransitionMatrix = {
  upcoming: {
    active: ['host', 'admin'],
    terminated: ['guest', 'host', 'admin'],
  },
  active: {
    extended: ['host', 'admin'],
    completed: ['host', 'admin'],
    terminated: ['admin'],
  },
  extended: {
    completed: ['host', 'admin'],
    terminated: ['admin'],
  },
};

export function canTransitionBookingRequest(
  currentState: BookingStatus,
  nextState: BookingStatus,
  actorRole: ActorRole
): boolean {
  if (currentState === nextState) return true;

  const allowedRoles = bookingTransitions[currentState]?.[nextState];
  if (!allowedRoles) return false;

  return allowedRoles.includes(actorRole);
}

export function canTransitionStay(
  currentState: StayStatus,
  nextState: StayStatus,
  actorRole: ActorRole
): boolean {
  if (currentState === nextState) return true;

  const allowedRoles = stayTransitions[currentState]?.[nextState];
  if (!allowedRoles) return false;

  return allowedRoles.includes(actorRole);
}
