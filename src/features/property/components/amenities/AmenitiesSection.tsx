import React from 'react';
import { AmenitiesService } from '../../services/amenities.service';

interface AmenitiesSectionProps {
  publicId: string;
}

export async function AmenitiesSection({ publicId }: AmenitiesSectionProps) {
  const amenities = await AmenitiesService.getAmenities(publicId);

  if (!amenities || amenities.length === 0) return null;

  // Prefer featured amenities, then take top 6 total
  const featured = amenities.filter((a) => a.isFeatured);
  const others = amenities.filter((a) => !a.isFeatured);
  const topAmenities = [...featured, ...others].slice(0, 6);

  return (
    <section className="py-8 border-b">
      <h2 className="text-xl font-semibold mb-6">What this place offers</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {topAmenities.map((amenity) => (
          <div key={amenity.id} className="flex items-center gap-4">
            <div className="text-gray-600">
              {amenity.icon ? (
                // Assuming lucide-react or similar is used, for now a placeholder icon
                <span className="material-icons">{amenity.icon}</span>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 26a12 12 0 1 1 12-12 12 12 0 0 1-12 12z" />
                </svg>
              )}
            </div>
            <span className="text-gray-800">{amenity.name}</span>
          </div>
        ))}
      </div>

      {amenities.length > 6 && (
        <button className="mt-8 px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Show all {amenities.length} amenities
        </button>
      )}
    </section>
  );
}
