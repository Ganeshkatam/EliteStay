'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HomeSectionConfig } from '../config/sections';
import { ListingCardData } from '@/features/listings/types';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { Container } from '@/components/layout/Container';

interface LazyHomeSectionProps {
  config: HomeSectionConfig;
}

export function LazyHomeSection({ config }: LazyHomeSectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [listings, setListings] = useState<ListingCardData[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine view all href
  const params = new URLSearchParams();
  Object.entries(config.filter).forEach(([key, value]) => {
    params.set(key, value);
  });
  const viewAllHref = `/s?${params.toString()}`;

  useEffect(() => {
    if (shouldLoad) return;

    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    let isFastScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const checkScrollVelocity = () => {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTime, 1);
      const dy = Math.abs(window.scrollY - lastScrollY);
      const velocity = dy / dt; // px/ms

      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Velocity > 1.2 px/ms means user is rapidly flinging/fast scrolling
      isFastScrolling = velocity > 1.2;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isFastScrolling = false;
        // If element is in viewport when scroll settles, trigger load
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          if (rect.top < window.innerHeight + 300 && rect.bottom > -300) {
            setShouldLoad(true);
          }
        }
      }, 150);
    };

    window.addEventListener('scroll', checkScrollVelocity, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Only trigger immediate load if user is NOT fast scrolling past
          if (!isFastScrolling) {
            setShouldLoad(true);
          }
        }
      },
      { rootMargin: '250px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkScrollVelocity);
      clearTimeout(scrollTimeout);
    };
  }, [shouldLoad]);

  // Fetch listings once section is triggered by deliberate/slow scroll
  useEffect(() => {
    if (!shouldLoad || listings !== null) return;

    let isMounted = true;

    fetch(`/api/home/sections?id=${encodeURIComponent(config.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setListings(data.listings || []);
        }
      })
      .catch((err) => {
        console.error(`Failed to fetch section ${config.id}:`, err);
        if (isMounted) {
          setListings([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shouldLoad, config.id, listings]);

  const isLoading = !shouldLoad || listings === null;

  return (
    <div
      ref={containerRef}
      className="min-h-[220px] transition-opacity duration-300"
    >
      <Container className="py-2">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {config.title}
            </h2>
            {config.subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{config.subtitle}</p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 whitespace-nowrap"
          >
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {isLoading ? (
          // Skeleton placeholder while waiting for intentional scroll or data
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : listings && listings.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/55">
            <p className="text-sm font-semibold text-gray-900">
              No properties available yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Check back soon or explore other categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in-50 duration-300">
            {listings?.map((listing) => (
              <ListingCard
                key={`${config.id}-${listing.publicId}`}
                listing={listing}
                aspectRatio="square"
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
