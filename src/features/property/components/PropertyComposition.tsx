import React, { Suspense } from 'react';
import { PropertyProvider } from '../context/PropertyContext';
import { PropertyShell, PropertyTwoColumnLayout } from './shared/PropertyShell';
import { PropertyHeader } from './shared/PropertyHeader';
import { HeroGallery } from './hero/HeroGallery';
import { BookingWidget } from './booking/BookingWidget';
import { HostSection } from './host/HostSection';
import { AmenitiesSection } from './amenities/AmenitiesSection';
import { ReviewsSection } from './reviews/ReviewsSection';
import { LocationSection } from './location/LocationSection';
import { PropertyBaseService } from '../services/property-base.service';
import { PropertySectionErrorBoundary } from './shared/PropertySectionErrorBoundary';

interface PropertyCompositionProps {
  publicId: string;
  slug: string;
}

function SectionSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className={`w-full rounded-2xl bg-gray-100 animate-pulse ${height}`} />
  );
}

export async function PropertyComposition({
  publicId,
  slug,
}: PropertyCompositionProps) {
  const baseDetails = await PropertyBaseService.getBaseDetails(publicId);
  const bookingPolicy = baseDetails?.bookingPolicy || 'RENTAL_APPLICATION';

  return (
    <PropertyProvider
      publicId={publicId}
      slug={slug}
      bookingPolicy={bookingPolicy}
    >
      <PropertyShell>
        {/* Priority 1: Base & Media (Hero) */}
        <PropertySectionErrorBoundary sectionName="Hero">
          <Suspense fallback={<SectionSkeleton height="h-[50vh]" />}>
            <PropertyHeader publicId={publicId} />
            <HeroGallery publicId={publicId} />
          </Suspense>
        </PropertySectionErrorBoundary>

        {/* Priority 2: Main Layout Split */}
        <PropertyTwoColumnLayout
          mainContent={
            <>
              {/* Priority 4: Host */}
              <PropertySectionErrorBoundary sectionName="Host">
                <Suspense fallback={<SectionSkeleton height="h-32" />}>
                  <HostSection publicId={publicId} />
                </Suspense>
              </PropertySectionErrorBoundary>

              {/* Priority 5: Amenities */}
              <PropertySectionErrorBoundary sectionName="Amenities">
                <Suspense fallback={<SectionSkeleton height="h-64" />}>
                  <AmenitiesSection publicId={publicId} />
                </Suspense>
              </PropertySectionErrorBoundary>

              {/* Priority 6: Sleeping */}
              <PropertySectionErrorBoundary sectionName="Sleeping Arrangements">
                <Suspense fallback={<SectionSkeleton height="h-48" />}>
                  {/* <SleepingSection publicId={publicId} /> */}
                  <div className="h-48 bg-purple-50 flex items-center justify-center">
                    Sleeping Placeholder
                  </div>
                </Suspense>
              </PropertySectionErrorBoundary>

              {/* Priority 7: Policies */}
              <PropertySectionErrorBoundary sectionName="Policies">
                <Suspense fallback={<SectionSkeleton height="h-48" />}>
                  {/* <PoliciesSection publicId={publicId} /> */}
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    Policies Placeholder
                  </div>
                </Suspense>
              </PropertySectionErrorBoundary>

              {/* Priority 8: Reviews */}
              <PropertySectionErrorBoundary sectionName="Reviews">
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <ReviewsSection publicId={publicId} />
                </Suspense>
              </PropertySectionErrorBoundary>

              {/* Priority 9: Map */}
              <PropertySectionErrorBoundary sectionName="Location">
                <Suspense fallback={<SectionSkeleton height="h-96" />}>
                  <LocationSection publicId={publicId} />
                </Suspense>
              </PropertySectionErrorBoundary>
            </>
          }
          sidebarContent={
            /* Priority 3: Booking Card */
            <PropertySectionErrorBoundary sectionName="Booking Widget">
              <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
                <BookingWidget publicId={publicId} />
              </Suspense>
            </PropertySectionErrorBoundary>
          }
        />
      </PropertyShell>
    </PropertyProvider>
  );
}
