/**
 * Global Motion System
 * Used for standardizing animation timings across the application.
 */
export const MOTION = {
  fast: 150,
  normal: 200,
  slow: 250,
  drawer: 300,
} as const;

export type MotionSpeed = keyof typeof MOTION;
