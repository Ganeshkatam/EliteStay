'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseInactivityRefreshOptions {
  /**
   * Inactivity threshold in minutes before triggering a refresh.
   * Default: 30 minutes.
   */
  timeoutMinutes?: number;
  /**
   * Minimum cooldown period between consecutive refreshes in milliseconds.
   * Default: 60,000 ms (1 minute).
   */
  cooldownMs?: number;
  /**
   * Callback invoked immediately before refresh is performed.
   */
  onRefresh?: () => void;
}

const DEFAULT_TIMEOUT_MINUTES = 30;
const DEFAULT_COOLDOWN_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 10_000; // Only update last-active timestamp every 10 seconds

/**
 * Hook to automatically refresh Next.js server components when the user
 * returns or resumes activity after an extended period of inactivity.
 */
export function useInactivityRefresh(
  options: UseInactivityRefreshOptions = {}
) {
  const {
    timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
    cooldownMs = DEFAULT_COOLDOWN_MS,
    onRefresh,
  } = options;

  const router = useRouter();
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const lastActiveRef = useRef<number>(0);
  const lastRefreshRef = useRef<number>(0);
  const lastThrottleRef = useRef<number>(0);

  const triggerRefresh = useCallback(() => {
    const now = Date.now();

    // Respect cooldown to prevent spamming refreshes
    if (now - lastRefreshRef.current < cooldownMs) {
      return;
    }

    // Do not disrupt active text input or typing
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true')
    ) {
      return;
    }

    lastRefreshRef.current = now;
    lastActiveRef.current = now;

    if (onRefresh) {
      onRefresh();
    }

    router.refresh();
  }, [cooldownMs, onRefresh, router]);

  const recordActivity = useCallback(() => {
    const now = Date.now();

    if (lastActiveRef.current === 0) {
      lastActiveRef.current = now;
      lastThrottleRef.current = now;
      return;
    }

    const elapsed = now - lastActiveRef.current;

    // If user was inactive for longer than the timeout, trigger refresh on their return
    if (elapsed >= timeoutMs) {
      triggerRefresh();
      return;
    }

    // Throttle timestamp updates during continuous interaction (e.g. mouse movement, scrolling)
    if (now - lastThrottleRef.current >= ACTIVITY_THROTTLE_MS) {
      lastThrottleRef.current = now;
      lastActiveRef.current = now;
    }
  }, [timeoutMs, triggerRefresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mountTime = Date.now();
    lastActiveRef.current = mountTime;
    lastThrottleRef.current = mountTime;

    // User activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleEvent = () => recordActivity();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // Check on tab visibility restoration (e.g. returning to background tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (
          lastActiveRef.current > 0 &&
          now - lastActiveRef.current >= timeoutMs
        ) {
          triggerRefresh();
        } else {
          lastActiveRef.current = now;
        }
      }
    };

    // Check on window focus
    const handleFocus = () => {
      const now = Date.now();
      if (
        lastActiveRef.current > 0 &&
        now - lastActiveRef.current >= timeoutMs
      ) {
        triggerRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Periodic heartbeat check for tabs that remain open and visible without interaction
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (
          lastActiveRef.current > 0 &&
          now - lastActiveRef.current >= timeoutMs
        ) {
          triggerRefresh();
        }
      }
    }, 60_000); // Check once every minute

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [recordActivity, timeoutMs, triggerRefresh]);
}
