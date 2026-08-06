import React from 'react';

interface PropertyJsonLdProps {
  property: {
    publicId: string;
    title: string;
    description: string;
    city: string;
    latitude: number;
    longitude: number;
    imageUrls: string[];
    price: number;
    currency: string;
    reviewAggregate?: {
      averageRating: number;
      totalReviews: number;
    };
  };
}

export function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    description: property.description,
    image: property.imageUrls,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    },
    priceRange: `${property.currency}${property.price}+`,
    ...(property.reviewAggregate && property.reviewAggregate.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: property.reviewAggregate.averageRating,
            reviewCount: property.reviewAggregate.totalReviews,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_APP_URL || 'https://elitestay.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: property.city,
        item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://elitestay.com'}/search?city=${encodeURIComponent(property.city)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.title,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
