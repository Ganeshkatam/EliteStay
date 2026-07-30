'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryProps {
  images: Array<{ url: string; displayOrder: number }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [showAll, setShowAll] = useState(false);

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

      {/* Mobile Swipe Layout */}
      <div className="md:hidden relative aspect-[4/3] w-full bg-gray-200">
        <Image
          src={mainImage.url}
          alt="Listing main view"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Placeholder for a mobile carousel slider */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          1 / {images.length}
        </div>
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

      {/* Fullscreen Modal (Placeholder implementation) */}
      {showAll && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">
          <div className="sticky top-0 p-4 bg-white/80 backdrop-blur-md flex justify-start border-b z-10">
            <button
              onClick={() => setShowAll(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 max-w-4xl mx-auto w-full flex flex-col gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
