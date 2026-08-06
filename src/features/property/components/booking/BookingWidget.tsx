import React from 'react';
import { PricingService } from '../../services/pricing.service';
import { BookingProvider } from '../../context/BookingContext';
import { ListingActionCard } from './ListingActionCard';

interface BookingWidgetProps {
  publicId: string;
}

export async function BookingWidget({ publicId }: BookingWidgetProps) {
  const pricing = await PricingService.getPricing(publicId);

  if (!pricing) {
    return (
      <div className="bg-white border rounded-2xl p-6 text-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
        <p className="text-gray-500">Pricing currently unavailable.</p>
      </div>
    );
  }

  return (
    <BookingProvider pricing={pricing}>
      <ListingActionCard />
    </BookingProvider>
  );
}
