import React, { useEffect } from 'react';
import { useReservationMachine } from '../hooks/useReservationMachine';
import { ReservationViewModelFactory } from '../view-models/reservation.viewmodel';
import { AvailabilityService } from '../services/availability.service';
import { PricingService } from '../services/pricing.service';
import { ReservationState } from '../types/reservation.types';
import { Database } from '@/types/database.types';

type ListingWithRelations = Database['public']['Tables']['listings']['Row'] & {
  pricing: Database['public']['Tables']['listing_prices']['Row'][];
  availability: Database['public']['Tables']['listing_availability']['Row'][];
  images: Database['public']['Tables']['listing_images']['Row'][];
  host: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'id' | 'full_name' | 'avatar_storage_path'
  > | null;
};

import { AvailabilityCalendar } from './AvailabilityCalendar';
import { GuestInformation } from './GuestInformation';
import { PricingBreakdown } from './PricingBreakdown';
import { ReservationSummary } from './ReservationSummary';
import { ReservationActions } from './ReservationActions';
import { AuthWallInterceptor } from './AuthWallInterceptor';

interface ReservationWorkspaceProps {
  initialListingData: ListingWithRelations; // Raw db row from page.tsx
}

export function ReservationWorkspace({
  initialListingData,
}: ReservationWorkspaceProps) {
  const {
    state,
    context,
    send,
    isAvailable,
    availabilityConstraints,
    availabilityReasons,
  } = useReservationMachine(initialListingData.id);

  // In a real app, we'd trigger server actions to check availability and pricing
  // when the state machine enters CHECK_AVAILABILITY. For this skeleton, we simulate it inline.
  useEffect(() => {
    if (state === ReservationState.DRAFT && context.intent.moveInDate) {
      // Simulate checking server
      const pricing = initialListingData.pricing?.[0] || null;
      const availability = initialListingData.availability?.[0] || null;

      const result = AvailabilityService.checkAvailability(
        initialListingData,
        pricing,
        availability,
        null, // No guest profile yet
        context.intent.moveInDate,
        context.intent.duration
      );

      if (result.isAvailable) {
        send({ type: 'CHECK_AVAILABILITY_SUCCESS', result });
      } else {
        send({ type: 'CHECK_AVAILABILITY_ERROR', reason: result.reasons[0] });
      }
    }
  }, [
    state,
    context.intent.moveInDate,
    context.intent.duration,
    initialListingData,
    send,
  ]);

  // Construct ViewModel dynamically based on current XState context
  const pricing = initialListingData.pricing?.[0] || null;
  const priceQuote =
    state !== ReservationState.DRAFT && context.intent.duration
      ? PricingService.getQuote(pricing, context.intent.duration)
      : null;

  const viewModel = ReservationViewModelFactory.create(
    initialListingData,
    context.intent.moveInDate,
    context.intent.duration,
    context.availabilityResult || {
      isAvailable: false,
      reasons: [],
      constraints: {
        minDuration: null,
        maxDuration: null,
        availableFrom: null,
        maxOccupancy: null,
      },
    },
    priceQuote,
    context.intent.guestDetails,
    state
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Request to Book</h1>

        {/* Progress Bar driven purely by XState */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-black h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${viewModel.progress.percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Flow */}
        <div className="lg:col-span-7">
          <AvailabilityCalendar
            viewModel={viewModel}
            send={send}
            availabilityConstraints={availabilityConstraints}
            availabilityReasons={availabilityReasons}
          />

          <div
            className={`transition-opacity duration-300 ${state === ReservationState.DRAFT || state === ReservationState.AVAILABILITY_CHECKED ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            <GuestInformation />
          </div>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            <ReservationSummary viewModel={viewModel} />
            <PricingBreakdown viewModel={viewModel} />
            <ReservationActions
              currentState={state}
              send={send}
              isAvailable={isAvailable}
              isValidGuestDetails={!!context.intent.guestDetails}
            />
          </div>
        </div>
      </div>

      <AuthWallInterceptor currentState={state} send={send} />
    </div>
  );
}
