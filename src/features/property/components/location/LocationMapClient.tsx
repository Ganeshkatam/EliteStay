'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapConfig } from '@/lib/maps';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
}

export function LocationMap({ latitude, longitude, city }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Setup IntersectionObserver to lazy load the map only when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );

    if (mapContainer.current) {
      observer.observe(mapContainer.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !mapContainer.current) return;

    let map: import('maplibre-gl').Map | null = null;
    const mapConfig = getMapConfig();

    // Dynamically import MapLibre to avoid heavy bundle upfront
    import('maplibre-gl').then((maplibregl) => {
      if (typeof maplibregl.setWorkerUrl === 'function') {
        maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
      }
      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: mapConfig.styleUrl as string,
        center: [longitude, latitude],
        zoom: 14,
        interactive: false, // Prevent scrolling from hijacking the page
        fadeDuration: 0,
        renderWorldCopies: false,
        maxTileCacheSize: 100,
      });

      // Add a simple marker
      new maplibregl.Marker({ color: '#E51D53' })
        .setLngLat([longitude, latitude])
        .addTo(map);
    });

    return () => {
      if (map) map.remove();
    };
  }, [isVisible, latitude, longitude]);

  return (
    <section className="py-8 border-b">
      <h2 className="text-xl font-semibold mb-6">Where you&apos;ll be</h2>

      <div
        ref={mapContainer}
        className="w-full h-[400px] rounded-2xl bg-gray-100 overflow-hidden"
      >
        {!isVisible && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Loading map...
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">{city}</h3>
        <p className="text-gray-600 mt-2">
          Exact location provided after booking.
        </p>
      </div>
    </section>
  );
}
