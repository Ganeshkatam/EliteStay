import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReservationViewModel } from '../view-models/reservation.viewmodel';
import { ReservationEvent } from '../machine/reservation.machine';

interface AvailabilityCalendarProps {
  viewModel: ReservationViewModel;
  send: (event: ReservationEvent) => void;
  availabilityConstraints: unknown;
  availabilityReasons: string[];
}

export function AvailabilityCalendar({
  send,
  availabilityReasons,
}: AvailabilityCalendarProps) {
  // In a real implementation, this would be a complex date picker
  // For the architectural skeleton, we render a placeholder with some info

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Select Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border p-4 rounded-lg flex items-center justify-center text-gray-500 h-32 mb-4">
          [Interactive Calendar Component Here]
        </div>

        {/* Demo buttons to trigger state machine for walkthrough */}
        <div className="flex gap-2 mb-4">
          <button
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
            onClick={() => {
              const moveIn = new Date();
              moveIn.setDate(moveIn.getDate() + 5);
              send({ type: 'SET_DATES', moveInDate: moveIn, duration: 3 });
            }}
          >
            Simulate selecting 3 months
          </button>
        </div>

        {availabilityReasons.length > 0 && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
            <p className="font-bold mb-1">Cannot reserve these dates:</p>
            <ul className="list-disc pl-5">
              {availabilityReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
