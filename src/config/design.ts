/**
 * EliteStay Design Constants
 *
 * Centralized design configuration for the application to prevent "magic numbers"
 * from spreading throughout the codebase and to make future design refinements easier.
 */

export const DESIGN = {
  // Spacing (rem)
  spacing: {
    pagePaddingX: 'px-4 sm:px-6 lg:px-8',
    sectionPaddingY: 'py-12 md:py-16 lg:py-24',
    stackGap: 'gap-4 md:gap-6',
    gridGap: 'gap-4 sm:gap-6 lg:gap-8',
  },

  // Elevation & Shadows
  elevation: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    base: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    float: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)]', // Custom premium float
  },

  // Border Radius
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  },

  // Animation Durations & Easing
  motion: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-250', // Restricted max for UI interactions per design rules
    ease: 'ease-out',
  },

  // Z-Index Layers
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;
