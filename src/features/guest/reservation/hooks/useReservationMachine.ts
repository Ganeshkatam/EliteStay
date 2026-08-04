import { useMachine } from '@xstate/react';
import { reservationMachine } from '../machine/reservation.machine';
import { ReservationState } from '../types/reservation.types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useReservationMachine(_listingId: string) {
  const [state, send] = useMachine(reservationMachine, {
    // initialize context overriding default empty string for listingId
  });

  // Small helper to get the enum state instead of string
  const currentState = state.value as ReservationState;

  return {
    state: currentState,
    context: state.context,
    send,
    isAvailable: state.context.availabilityResult?.isAvailable ?? false,
    availabilityConstraints:
      state.context.availabilityResult?.constraints ?? null,
    availabilityReasons: state.context.availabilityResult?.reasons ?? [],
    error: state.context.error,
  };
}
