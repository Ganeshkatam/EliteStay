import { PropertyJsonLd } from './PropertyJsonLd';
import { PropertyBaseService } from '../../services/property-base.service';
import { PropertyMediaService } from '../../services/media.service';
import { PricingService } from '../../services/pricing.service';
import { ReviewService } from '../../services/review.service';

interface PropertyStructuredDataProps {
  publicId: string;
}

export async function PropertyStructuredData({
  publicId,
}: PropertyStructuredDataProps) {
  // Fetch everything in parallel since they are independent cache lookups
  const [base, media, pricing, reviews] = await Promise.all([
    PropertyBaseService.getBaseDetails(publicId),
    PropertyMediaService.getMedia(publicId),
    PricingService.getPricing(publicId),
    ReviewService.getReviews(publicId),
  ]);

  if (!base || !pricing) return null;

  return (
    <PropertyJsonLd
      property={{
        publicId,
        title: base.title,
        description: base.description,
        city: base.location.city,
        latitude: base.location.latitude,
        longitude: base.location.longitude,
        imageUrls: media.map(
          (m) =>
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${m.storagePath}`
        ),
        price: pricing.amount,
        currency: pricing.currency,
        reviewAggregate: reviews?.summary
          ? {
              averageRating: reviews.summary.averageRating,
              totalReviews: reviews.summary.totalReviews,
            }
          : undefined,
      }}
    />
  );
}
