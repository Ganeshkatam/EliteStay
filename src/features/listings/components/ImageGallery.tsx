'use client';

import Image from 'next/image';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: Array<{ url: string; displayOrder: number }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback((index: number) => {
    setModalIndex(index);
    setShowAll(true);
  }, []);

  const goToPrev = useCallback(() => {
    setModalIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setModalIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!showAll) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAll(false);
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAll, goToPrev, goToNext]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[2/1] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  const mainImage = images[0];
  const gridImages = images.slice(1, 5);

  return (
    <div className="relative w-full">
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden relative">
        <div
          className="col-span-2 row-span-2 relative group cursor-pointer"
          onClick={() => setShowAll(true)}
        >
          <Image
            src={mainImage.url}
            alt="Listing main view"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        </div>

        {gridImages.map((img, idx) => (
          <div
            key={idx}
            className="relative group cursor-pointer"
            onClick={() => setShowAll(true)}
          >
            <Image
              src={img.url}
              alt={`Listing view ${idx + 2}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </div>
        ))}
      </div>

      {/* Mobile Swipe Carousel */}
      <div className="md:hidden relative w-full overflow-hidden rounded-2xl bg-gray-200">
        <div
          ref={mobileCarouselRef}
          onScroll={(event) => {
            const target = event.currentTarget;
            const width = target.clientWidth;
            if (width > 0) {
              setActiveIndex(
                Math.min(
                  images.length - 1,
                  Math.max(0, Math.round(target.scrollLeft / width))
                )
              );
            }
          }}
          className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-hide"
          aria-label="Listing photo gallery"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openModal(idx)}
              className="relative min-w-full shrink-0 snap-center aspect-[4/3] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-inset"
              aria-label={`Open listing photo ${idx + 1} of ${images.length}`}
            >
              <Image
                src={img.url}
                alt={`Listing view ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="100vw"
              />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Swipe to explore
          </div>
        )}
      </div>

      {/* Show All Images Button */}
      {images.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-900/10 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Show all photos
        </button>
      )}

      {/* Fullscreen Photo Viewer Modal */}
      {showAll && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Listing photo gallery viewer"
          className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
        >
          {/* Header Bar */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
            <span className="text-sm font-semibold text-slate-200">
              {modalIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close photo viewer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Viewer Stage */}
          <div className="relative flex flex-1 items-center justify-center p-4">
            {images.length > 1 && (
              <button
                onClick={goToPrev}
                className="absolute left-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="relative h-full w-full max-w-5xl">
              <Image
                src={images[modalIndex].url}
                alt={`Photo ${modalIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 p-3 no-scrollbar justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalIndex(idx)}
                  className={cn(
                    'relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all min-h-11 min-w-11 focus:outline-none',
                    idx === modalIndex
                      ? 'border-white opacity-100 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  )}
                  aria-label={`Jump to photo ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
