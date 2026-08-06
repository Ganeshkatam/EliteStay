'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { PropertyPricing } from '../services/pricing.service';

interface BookingState {
  moveInDate: Date | null;
  leaseDurationMonths: number;
  guests: number;
}

interface BookingContextValue {
  pricing: PropertyPricing;
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  pricing,
}: React.PropsWithChildren<{ pricing: PropertyPricing }>) {
  const [state, setState] = useState<BookingState>({
    moveInDate: null,
    leaseDurationMonths: 1,
    guests: 1,
  });

  const value = useMemo(() => ({ pricing, state, setState }), [pricing, state]);

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
