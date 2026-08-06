import React from 'react';
import { PropertyBaseService } from '../../services/property-base.service';
import { LocationMap } from './LocationMapClient';

interface LocationSectionProps {
  publicId: string;
}

export async function LocationSection({ publicId }: LocationSectionProps) {
  const property = await PropertyBaseService.getBaseDetails(publicId);

  if (!property) return null;

  return (
    <LocationMap
      latitude={property.location.latitude}
      longitude={property.location.longitude}
      city={property.location.city}
    />
  );
}
