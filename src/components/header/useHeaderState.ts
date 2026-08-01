'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type HeaderVariant = 'public-home' | 'public' | 'host' | 'auth' | 'dashboard';

export function useHeaderState() {
  const pathname = usePathname();
  
  // Determine variant based on route
  let variant: HeaderVariant = 'public';
  if (pathname === '/') {
    variant = 'public-home';
  } else if (pathname?.startsWith('/host')) {
    variant = 'host';
  } else if (
    pathname?.match(/^\/(login|signup|forgot-password|reset-password)$/)
  ) {
    variant = 'auth';
  } else if (pathname?.startsWith('/users')) {
    variant = 'dashboard';
  }

  // Manage expanded state using hysteresis and throttling
  const [isExpanded, setIsExpanded] = useState(variant === 'public-home');

  useEffect(() => {
    if (variant !== 'public-home') {
      setIsExpanded(false);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          setIsExpanded((prev) => {
            // Hysteresis logic
            // Collapse when scrolling down past 80px
            if (prev && currentScrollY > 80) {
              return false;
            }
            // Expand when scrolling back up past 40px
            if (!prev && currentScrollY < 40) {
              return true;
            }
            return prev;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  return {
    variant,
    isExpanded,
  };
}
