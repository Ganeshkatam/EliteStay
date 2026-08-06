'use client';

import React from 'react';
import Image from 'next/image';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import { PropertyMedia } from '../../services/media.service';

interface HeroGalleryClientProps {
  media: PropertyMedia[];
  publicUrlPrefix: string;
}

export function HeroGalleryClient({
  media,
  publicUrlPrefix,
}: HeroGalleryClientProps) {
  if (!media || media.length === 0) {
    return (
      <div className="w-full h-[50vh] min-h-[300px] max-h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  // Use the first image as cover, then up to 4 more for the grid
  const coverImage = media[0];
  const gridImages = media.slice(1, 5);

  const getFullUrl = (path: string) => `${publicUrlPrefix}/${path}`;

  return (
    <Gallery
      options={{
        showHideAnimationType: 'zoom',
        zoomAnimationDuration: 300,
        bgOpacity: 0.9,
      }}
    >
      <div className="relative w-full h-[50vh] min-h-[300px] max-h-[500px] rounded-2xl overflow-hidden flex gap-2">
        {/* Cover Image (Left half) */}
        <div className="w-full md:w-1/2 h-full relative cursor-pointer group">
          <Item
            original={getFullUrl(coverImage.storagePath)}
            thumbnail={getFullUrl(coverImage.storagePath)}
            width="1200" // We should ideally get actual dimensions from DB
            height="800"
          >
            {({ ref, open }) => (
              <div
                ref={ref as React.Ref<HTMLDivElement>}
                onClick={open}
                className="w-full h-full relative"
              >
                <Image
                  src={getFullUrl(coverImage.storagePath)}
                  alt="Property Cover"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            )}
          </Item>
        </div>

        {/* Thumbnail Grid (Right half - desktop only) */}
        <div className="hidden md:grid md:w-1/2 h-full grid-cols-2 grid-rows-2 gap-2">
          {gridImages.map((img, index) => {
            const isLast = index === 3;
            const remainingCount = media.length - 5;

            return (
              <div
                key={img.id}
                className="relative cursor-pointer group h-full w-full"
              >
                <Item
                  original={getFullUrl(img.storagePath)}
                  thumbnail={getFullUrl(img.storagePath)}
                  width="1200"
                  height="800"
                >
                  {({ ref, open }) => (
                    <div
                      ref={ref as React.Ref<HTMLDivElement>}
                      onClick={open}
                      className="w-full h-full relative"
                    >
                      <Image
                        src={getFullUrl(img.storagePath)}
                        alt={`Property view ${index + 2}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                      {/* Show "View all" overlay on the last image if there are more */}
                      {isLast && remainingCount > 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-semibold flex items-center gap-2">
                            <svg
                              viewBox="0 0 32 32"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                              role="presentation"
                              focusable="false"
                              style={{
                                display: 'block',
                                fill: 'none',
                                height: '16px',
                                width: '16px',
                                stroke: 'currentcolor',
                                strokeWidth: '3',
                                overflow: 'visible',
                              }}
                            >
                              <g fill="none">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="m19 19 11 11"></path>
                              </g>
                            </svg>
                            Show all photos
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Item>
              </div>
            );
          })}
        </div>

        {/* Hidden items for the rest of the gallery so they show up in the lightbox */}
        <div className="hidden">
          {media.slice(5).map((img) => (
            <Item
              key={img.id}
              original={getFullUrl(img.storagePath)}
              thumbnail={getFullUrl(img.storagePath)}
              width="1200"
              height="800"
            >
              {({ ref, open }) => (
                <div ref={ref as React.Ref<HTMLDivElement>} onClick={open} />
              )}
            </Item>
          ))}
        </div>

        {/* Floating "Show all photos" button for mobile */}
        <div className="md:hidden absolute bottom-4 right-4 z-10">
          {/* Mobile usually just taps the image to open, or we can add a button here */}
        </div>
      </div>
    </Gallery>
  );
}
