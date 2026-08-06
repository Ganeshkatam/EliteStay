import React from 'react';
import Image from 'next/image';
import { ReviewService } from '../../services/review.service';

interface ReviewsSectionProps {
  publicId: string;
}

export async function ReviewsSection({ publicId }: ReviewsSectionProps) {
  const data = await ReviewService.getReviews(publicId);

  if (!data || data.reviews.length === 0) return null;

  const publicUrlPrefix = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars`
    : '';

  return (
    <section className="py-8 border-b">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl text-yellow-400 font-bold">★</span>
        <h2 className="text-2xl font-semibold">
          {data.summary?.averageRating || 5.0} ·{' '}
          {data.summary?.totalReviews || data.reviews.length} reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {data.reviews.map((review) => (
          <div key={review.id}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {review.guestAvatar ? (
                  <Image
                    src={`${publicUrlPrefix}/${review.guestAvatar}`}
                    alt={review.guestName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-lg">
                    {review.guestName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold">{review.guestName}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed line-clamp-3">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {(data.summary?.totalReviews || 0) > 4 && (
        <button className="mt-8 px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Show all {data.summary?.totalReviews} reviews
        </button>
      )}
    </section>
  );
}
