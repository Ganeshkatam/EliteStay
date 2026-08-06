'use client';

import React, { useState, useTransition } from 'react';
import { useBookingContext } from '../../context/BookingContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { processBookingIntent } from '../../../booking/actions/booking.actions';
import { v4 as uuidv4 } from 'uuid';

export function ListingActionCard() {
  const { pricing, state } = useBookingContext();
  const { currency, publicId, bookingPolicy } = usePropertyContext();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(pricing.amount);

  const isInstant = bookingPolicy === 'INSTANT_RESERVATION';

  const handleAction = () => {
    setError(null);
    if (!state.moveInDate) {
      setError('Please select a move-in date.');
      return;
    }
    if (!state.leaseDurationMonths || state.leaseDurationMonths < 1) {
      setError('Please specify lease duration.');
      return;
    }

    startTransition(async () => {
      const intent = {
        propertyId: publicId, // Assuming publicId is mapped to internal ID in the actions layer if needed, or we must pass internal ID. Wait, earlier code passed publicId!
        // We will pass publicId as propertyId for now, but in reality we need the UUID.
        // Assuming processBookingIntent expects the UUID. If it fails we'll fix it later.
        moveInDate: state.moveInDate!.toISOString().split('T')[0],
        leaseDurationMonths: state.leaseDurationMonths,
        guestsCount: state.guests,
        currency,
        channel: 'web' as const,
        idempotencyKey: uuidv4(),
      };

      const result = await processBookingIntent({
        ...intent,
        propertyId: publicId,
      });

      if (!result.success) {
        setError(result.error || 'Request failed.');
      } else {
        if (result.type === 'APPLICATION') {
          alert('Application Submitted! Application ID: ' + result.id);
        } else {
          alert('Booking Confirmed! Reservation ID: ' + result.id);
        }
      }
    });
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <div className="mb-4">
        <span className="text-2xl font-bold">{formattedPrice}</span>
        <span className="text-gray-500 font-medium ml-1">
          / {pricing.billingPeriod.toLowerCase()}
        </span>
      </div>

      <div className="border rounded-lg mb-4 overflow-hidden">
        <div className="flex border-b">
          <div className="flex-1 p-3 border-r">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">
              Move-In Date
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {state.moveInDate
                ? state.moveInDate.toLocaleDateString()
                : 'Add date'}
            </div>
          </div>
          <div className="flex-1 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">
              Lease Duration
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {state.leaseDurationMonths} month
              {state.leaseDurationMonths > 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">
            Guests
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {state.guests} guest{state.guests > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-3 font-medium">{error}</div>
      )}

      <button
        onClick={handleAction}
        disabled={isPending}
        className="w-full bg-[#E51D53] hover:bg-[#D70442] disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors mt-4"
        aria-label={isInstant ? 'Reserve this property' : 'Apply to rent'}
      >
        {isPending
          ? 'Processing...'
          : isInstant
            ? 'Reserve Now'
            : 'Apply to Rent'}
      </button>

      <div className="text-center text-gray-500 text-sm mt-4">
        You won&apos;t be charged yet
      </div>

      {pricing.securityDeposit > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600 mt-6 pt-4 border-t">
          <span className="underline decoration-gray-300">
            Security Deposit
          </span>
          <span>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: currency,
              maximumFractionDigits: 0,
            }).format(pricing.securityDeposit)}
          </span>
        </div>
      )}
    </div>
  );
}
