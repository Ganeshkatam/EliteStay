'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseInactivityRefreshOptions {
  /**
   * Inactivity threshold in minutes before prompting the user to refresh.
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

export interface UseInactivityRefreshReturn {
  needsRefresh: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  dismiss: () => void;
}

const DEFAULT_TIMEOUT_MINUTES = 30;
const DEFAULT_COOLDOWN_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 10_000; // Only update last-active timestamp every 10 seconds

/**
 * Hook to detect prolonged user inactivity and notify when the page needs a refresh.
 *
 * This hook NEVER auto-refreshes the page underneath an active or viewing user.
 * Instead, it tracks idle time and sets `needsRefresh` to true so the UI can present
 * a non-intrusive refresh prompt.
 */
export function useInactivityRefresh(
  options: UseInactivityRefreshOptions = {}
): UseInactivityRefreshReturn {
  const {
    timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
    cooldownMs = DEFAULT_COOLDOWN_MS,
    onRefresh,
  } = options;

  const router = useRouter();
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const lastActiveRef = useRef<number>(0);
  const lastRefreshRef = useRef<number>(0);
  const lastThrottleRef = useRef<number>(0);

  const refresh = useCallback(() => {
    const now = Date.now();

    if (now - lastRefreshRef.current < cooldownMs) {
      setNeedsRefresh(false);
      return;
    }

    setIsRefreshing(true);
    lastRefreshRef.current = now;
    lastActiveRef.current = now;
    lastThrottleRef.current = now;

    if (onRefresh) {
      onRefresh();
    }

    try {
      router.refresh();
    } finally {
      // Allow brief visual feedback before dismissing prompt
      setTimeout(() => {
        setIsRefreshing(false);
        setNeedsRefresh(false);
      }, 500);
    }
  }, [cooldownMs, onRefresh, router]);

  const dismiss = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    lastThrottleRef.current = now;
    setNeedsRefresh(false);
  }, []);

  const recordActivity = useCallback(() => {
    const now = Date.now();

    if (lastActiveRef.current === 0) {
      lastActiveRef.current = now;
      lastThrottleRef.current = now;
      return;
    }

    const elapsed = now - lastActiveRef.current;

    // If inactivity timeout has elapsed, flag that the page needs a refresh instead of auto-refreshing
    if (elapsed >= timeoutMs) {
      setNeedsRefresh(true);
      return;
    }

    // Throttle timestamp updates during continuous interaction
    if (now - lastThrottleRef.current >= ACTIVITY_THROTTLE_MS) {
      lastThrottleRef.current = now;
      lastActiveRef.current = now;
    }
  }, [timeoutMs]);

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

    // Check when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (
          lastActiveRef.current > 0 &&
          now - lastActiveRef.current >= timeoutMs
        ) {
          setNeedsRefresh(true);
        } else if (lastActiveRef.current === 0) {
          lastActiveRef.current = now;
        }
      }
    };

    // Check when window gains focus
    const handleFocus = () => {
      const now = Date.now();
      if (
        lastActiveRef.current > 0 &&
        now - lastActiveRef.current >= timeoutMs
      ) {
        setNeedsRefresh(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Periodic heartbeat check for tabs left open without interaction
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (
          lastActiveRef.current > 0 &&
          now - lastActiveRef.current >= timeoutMs
        ) {
          setNeedsRefresh(true);
        }
      }
    }, 60_000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [recordActivity, timeoutMs]);

  return {
    needsRefresh,
    isRefreshing,
    refresh,
    dismiss,
  };
}
