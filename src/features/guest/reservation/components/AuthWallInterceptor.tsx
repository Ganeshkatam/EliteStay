'use client';

import { useEffect } from 'react';
import { ReservationState } from '../types/reservation.types';
import { ReservationEvent } from '../machine/reservation.machine';

interface AuthWallInterceptorProps {
  currentState: ReservationState;
  send: (event: ReservationEvent) => void;
}

export function AuthWallInterceptor({
  currentState,
  send,
}: AuthWallInterceptorProps) {
  useEffect(() => {
    // If we enter the AWAITING_AUTH state, we trigger the auth flow.
    // In a real app, this would open the Supabase Auth modal.
    if (currentState === ReservationState.AWAITING_AUTH) {
      console.log('AuthWallInterceptor: Opening auth modal...');

      // Simulate auth completing after 2 seconds
      const timer = setTimeout(() => {
        console.log(
          'AuthWallInterceptor: Auth successful, auto-resuming flow.'
        );
        send({ type: 'AUTH_COMPLETED' });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentState, send]);

  if (currentState !== ReservationState.AWAITING_AUTH) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
        <p className="text-gray-500 mb-6">
          You need an account to reserve this home.
        </p>

        {/* Placeholder for real Auth form */}
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mb-6">
          [Auth UI]
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
          <span>Simulating authentication...</span>
        </div>
      </div>
    </div>
  );
}
