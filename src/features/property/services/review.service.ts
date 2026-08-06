import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  guestName: string;
  guestAvatar: string | null;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface PropertyReviewsData {
  summary: ReviewSummary | null;
  reviews: PropertyReview[];
}

export class ReviewService {
  static async getReviews(
    publicId: string
  ): Promise<PropertyReviewsData | null> {
    const data = await fetchWithCache({
      key: CacheKeys.propertyReviews(publicId),
      ttl: TTL.PROPERTY_REVIEWS,
      negativeTtl: TTL.NEGATIVE_404,
      fetcher: async () => {
        const raw = await PropertyRepository.getReviews(publicId);
        if (!raw) return null;

        const reviews = raw.reviews.map(
          (r: {
            id: string;
            rating: number;
            comment: string;
            created_at: string;
            profiles:
              | { display_name: string; avatar_storage_path: string }
              | { display_name: string; avatar_storage_path: string }[];
          }) => {
            const profile = Array.isArray(r.profiles)
              ? r.profiles[0]
              : r.profiles;
            return {
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.created_at,
              guestName: profile?.display_name || 'Guest',
              guestAvatar: profile?.avatar_storage_path || null,
            };
          }
        );

        // Compute local summary if RPC returns null (fallback)
        let summary = raw.summary;
        if (!summary && reviews.length > 0) {
          const totalRating = reviews.reduce(
            (sum: number, r: { rating: number }) => sum + r.rating,
            0
          );
          summary = {
            averageRating: Number((totalRating / reviews.length).toFixed(1)),
            totalReviews: reviews.length, // Should ideally be total from DB
          };
        }

        return {
          reviews,
          summary: summary
            ? {
                averageRating:
                  summary.averageRating || summary.average_rating || 0,
                totalReviews:
                  summary.totalReviews ||
                  summary.total_reviews ||
                  reviews.length,
              }
            : null,
        };
      },
    });

    return data;
  }
}
