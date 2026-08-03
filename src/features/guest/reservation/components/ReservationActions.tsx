import React from 'react';
import { ReservationState } from '../types/reservation.types';
import { ReservationEvent } from '../machine/reservation.machine';
import { Button } from '@/components/ui/button';

interface ReservationActionsProps {
  currentState: ReservationState;
  send: (event: ReservationEvent) => void;
  isAvailable: boolean;
  isValidGuestDetails: boolean;
}

export function ReservationActions({
  currentState,
  send,
  isAvailable,
  isValidGuestDetails,
}: ReservationActionsProps) {
  return (
    <div className="w-full mt-6 sticky bottom-4 z-10 bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg border">
      {currentState === ReservationState.DRAFT && (
        <Button
          className="w-full h-12 text-lg"
          onClick={() => send({ type: 'CHECK_AVAILABILITY' })}
        >
          Check Availability
        </Button>
      )}

      {currentState === ReservationState.AVAILABILITY_CHECKED && (
        <Button
          className="w-full h-12 text-lg"
          onClick={() => send({ type: 'LOCK_PRICE' })}
          disabled={!isAvailable}
        >
          Continue
        </Button>
      )}

      {currentState === ReservationState.PRICE_LOCKED && (
        <Button
          className="w-full h-12 text-lg"
          onClick={() =>
            send({
              type: 'SET_GUEST_DETAILS',
              details: {
                firstName: 'Stub',
                lastName: 'Stub',
                email: '',
                phone: '',
              },
            })
          }
        >
          Continue to Details
        </Button>
      )}

      {currentState === ReservationState.GUEST_DETAILS_COMPLETED && (
        <Button
          className="w-full h-12 text-lg"
          onClick={() => send({ type: 'CONTINUE_RESERVATION' })}
          disabled={!isValidGuestDetails}
        >
          Continue Reservation
        </Button>
      )}

      {currentState === ReservationState.AWAITING_AUTH && (
        <Button className="w-full h-12 text-lg" disabled>
          Authenticating...
        </Button>
      )}

      {currentState === ReservationState.READY_FOR_BOOKING && (
        <Button
          className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          onClick={() => alert('Sprint 2: Proceed to Booking Creation!')}
        >
          Confirm Reservation
        </Button>
      )}
    </div>
  );
}
