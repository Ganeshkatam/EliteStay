'use client';

import React, { createContext, useContext, useMemo } from 'react';

interface PropertyContextValue {
  publicId: string;
  slug: string;
  locale: string;
  currency: string;
  bookingPolicy:
    | 'INSTANT_RESERVATION'
    | 'RENTAL_APPLICATION'
    | 'VIEWING_REQUEST'
    | 'CONTACT_HOST';
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

export function PropertyProvider({
  children,
  publicId,
  slug,
  bookingPolicy,
  locale = 'en-IN',
  currency = 'INR',
}: React.PropsWithChildren<
  Partial<PropertyContextValue> & {
    publicId: string;
    slug: string;
    bookingPolicy:
      | 'INSTANT_RESERVATION'
      | 'RENTAL_APPLICATION'
      | 'VIEWING_REQUEST'
      | 'CONTACT_HOST';
  }
>) {
  const value = useMemo(
    () => ({ publicId, slug, locale, currency, bookingPolicy }),
    [publicId, slug, locale, currency, bookingPolicy]
  );

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error(
      'usePropertyContext must be used within a PropertyProvider'
    );
  }
  return context;
}
