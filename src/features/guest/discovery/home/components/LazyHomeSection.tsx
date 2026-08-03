'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HomeSectionConfig } from '../config/sections';
import { ListingCardData } from '@/features/listings/types';
import { ListingCard } from '@/features/guest/discovery/shared/components/ListingCard';
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
          <div className="flex overflow-hidden gap-6 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] aspect-square rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide animate-in fade-in-50 duration-300">
            {listings?.map((listing) => (
              <div
                key={`${config.id}-${listing.publicId}`}
                className="snap-start shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px]"
              >
                <ListingCard listing={listing} aspectRatio="square" />
              </div>
            ))}
            {listings && listings.length >= config.limit && (
              <div className="snap-start shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] flex items-center justify-center">
                <Link
                  href={viewAllHref}
                  className="group flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300 shadow-sm">
                    <svg
                      className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    See all
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Explore {config.title}
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
