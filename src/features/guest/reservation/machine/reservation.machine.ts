import { setup, assign } from 'xstate';
import {
  ReservationState,
  ReservationIntent,
  GuestDetails,
  AvailabilityResult,
} from '../types/reservation.types';

// Define the events the machine can receive
export type ReservationEvent =
  | { type: 'SET_DATES'; moveInDate: Date; duration: number }
  | { type: 'CHECK_AVAILABILITY' }
  | { type: 'CHECK_AVAILABILITY_SUCCESS'; result: AvailabilityResult }
  | { type: 'CHECK_AVAILABILITY_ERROR'; reason: string }
  | { type: 'LOCK_PRICE' }
  | { type: 'SET_GUEST_DETAILS'; details: GuestDetails }
  | { type: 'CONTINUE_RESERVATION' } // triggers auth wall
  | { type: 'AUTH_COMPLETED' };

// Define the machine's context (extended state)
export interface ReservationContext {
  intent: ReservationIntent;
  availabilityResult: AvailabilityResult | null;
  error: string | null;
}

export const reservationMachine = setup({
  types: {
    context: {} as ReservationContext,
    events: {} as ReservationEvent,
  },
  actions: {
    assignDates: assign({
      intent: ({ context, event }) => {
        if (event.type !== 'SET_DATES') return context.intent;
        return {
          ...context.intent,
          moveInDate: event.moveInDate,
          duration: event.duration,
        };
      },
      error: () => null,
    }),
    assignAvailability: assign({
      availabilityResult: ({ event }) => {
        if (event.type !== 'CHECK_AVAILABILITY_SUCCESS') return null;
        return event.result;
      },
      error: () => null,
    }),
    assignError: assign({
      error: ({ event }) => {
        if (event.type !== 'CHECK_AVAILABILITY_ERROR') return null;
        return event.reason;
      },
    }),
    assignGuestDetails: assign({
      intent: ({ context, event }) => {
        if (event.type !== 'SET_GUEST_DETAILS') return context.intent;
        return {
          ...context.intent,
          guestDetails: event.details,
        };
      },
    }),
  },
  guards: {
    hasDates: ({ context }) =>
      !!(context.intent.moveInDate && context.intent.duration),
    isAvailable: ({ context }) => !!context.availabilityResult?.isAvailable,
    hasGuestDetails: ({ context }) => !!context.intent.guestDetails,
  },
}).createMachine({
  id: 'reservation',
  initial: ReservationState.DRAFT,
  context: {
    intent: {
      intentId:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'fallback-uuid',
      listingId: '',
      moveInDate: null,
      duration: null,
      guestDetails: null,
    },
    availabilityResult: null,
    error: null,
  },
  states: {
    [ReservationState.DRAFT]: {
      on: {
        SET_DATES: {
          actions: 'assignDates',
          // Stay in DRAFT, UI will trigger check availability next
        },
        CHECK_AVAILABILITY_SUCCESS: {
          target: ReservationState.AVAILABILITY_CHECKED,
          actions: 'assignAvailability',
          guard: 'hasDates',
        },
        CHECK_AVAILABILITY_ERROR: {
          actions: 'assignError',
        },
      },
    },
    [ReservationState.AVAILABILITY_CHECKED]: {
      on: {
        SET_DATES: {
          target: ReservationState.DRAFT,
          actions: 'assignDates',
        },
        LOCK_PRICE: {
          target: ReservationState.PRICE_LOCKED,
          guard: 'isAvailable',
        },
      },
    },
    [ReservationState.PRICE_LOCKED]: {
      on: {
        SET_GUEST_DETAILS: {
          target: ReservationState.GUEST_DETAILS_COMPLETED,
          actions: 'assignGuestDetails',
        },
        SET_DATES: {
          target: ReservationState.DRAFT,
          actions: 'assignDates',
        },
      },
    },
    [ReservationState.GUEST_DETAILS_COMPLETED]: {
      on: {
        CONTINUE_RESERVATION: {
          target: ReservationState.AWAITING_AUTH,
        },
        SET_GUEST_DETAILS: {
          actions: 'assignGuestDetails', // update details without advancing
        },
        SET_DATES: {
          target: ReservationState.DRAFT,
          actions: 'assignDates',
        },
      },
    },
    [ReservationState.AWAITING_AUTH]: {
      on: {
        AUTH_COMPLETED: {
          target: ReservationState.READY_FOR_BOOKING,
        },
      },
    },
    [ReservationState.READY_FOR_BOOKING]: {
      type: 'final',
    },
  },
});
