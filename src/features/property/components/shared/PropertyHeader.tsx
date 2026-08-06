import React from 'react';
import { PropertyBaseService } from '../../services/property-base.service';

interface PropertyHeaderProps {
  publicId: string;
}

export async function PropertyHeader({ publicId }: PropertyHeaderProps) {
  const property = await PropertyBaseService.getBaseDetails(publicId);

  if (!property) {
    // Handled by outer error boundary or 404
    return null;
  }

  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
        {property.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-1 font-medium text-gray-900">
          <span className="text-yellow-400">★</span>
          <span>New</span>
        </div>

        <span>·</span>

        <span className="underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-gray-900">
          {property.location.locality}, {property.location.city}
        </span>
      </div>
    </header>
  );
}
