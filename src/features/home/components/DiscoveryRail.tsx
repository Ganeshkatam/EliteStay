'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscoveryRailProps {
  children: React.ReactNode;
  className?: string;
}

export function DiscoveryRail({ children, className }: DiscoveryRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Dragging state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragged = useRef(false);

  const updateArrows = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 2);
    // Use Math.ceil to prevent subpixel issues on high DPI screens
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateArrows();
    window.addEventListener('resize', updateArrows);
    container.addEventListener('scroll', updateArrows);

    return () => {
      window.removeEventListener('resize', updateArrows);
      container.removeEventListener('scroll', updateArrows);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth } = container;
    const scrollAmount = clientWidth * 0.75; // Scroll 75% of container width
    const targetScroll =
      container.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    isDragging.current = true;
    dragged.current = false;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
    container.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed modifier
    if (Math.abs(walk) > 5) {
      dragged.current = true;
    }
    container.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    const container = containerRef.current;
    isDragging.current = false;
    if (container) {
      container.style.scrollBehavior = 'smooth';
      container.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp();
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
      dragged.current = false;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const canScroll = container.scrollWidth > container.clientWidth;
    if (e.deltaY !== 0 && canScroll) {
      const isAtLeft = container.scrollLeft <= 2;
      const isAtRight =
        Math.ceil(container.scrollLeft + container.clientWidth) >=
        container.scrollWidth - 2;
      if ((e.deltaY < 0 && !isAtLeft) || (e.deltaY > 0 && !isAtRight)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <div className="group relative w-full select-none">
      {/* Left Fade Gradient */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ease-out',
          showLeftArrow ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Right Fade Gradient */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ease-out',
          showRightArrow ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Navigation Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center border hover:scale-105 active:scale-95 transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 pointer-events-auto"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Navigation Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center border hover:scale-105 active:scale-95 transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 pointer-events-auto"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={handleClickCapture}
        onWheel={handleWheel}
        style={{ cursor: 'grab' }}
        className={cn(
          'flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 select-none touch-pan-x',
          'scrollbar-none [&::-webkit-scrollbar]:hidden',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
