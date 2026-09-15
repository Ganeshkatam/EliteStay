'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseInactivityRefreshOptions {
  /**
   * Inactivity threshold in minutes before auto-refreshing on return
   * or showing the refresh prompt if still actively viewing.
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
const ACTIVITY_THROTTLE_MS = 10_000; // Throttle timestamp updates to every 10s during continuous interaction

function isElementEditable(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    el.getAttribute('contenteditable') === 'true'
  );
}

/**
 * Hook to handle inactivity refresh:
 * 1. When the user returns directly after the timeout has elapsed (from another tab or window),
 *    the app is automatically refreshed.
 * 2. While the user is actively viewing or using the app, it NEVER auto-refreshes underneath them.
 *    Instead, it alerts the user with a non-intrusive notification that the page has updates available.
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

  // Tracking background/away state
  const wasAwayRef = useRef<boolean>(false);
  const awaySinceRef = useRef<number>(0);

  const executeRefresh = useCallback(() => {
    const now = Date.now();

    if (now - lastRefreshRef.current < cooldownMs) {
      setNeedsRefresh(false);
      return;
    }

    // Do not auto-refresh if user is currently editing a form element
    if (isElementEditable(document.activeElement)) {
      setNeedsRefresh(true);
      return;
    }

    setIsRefreshing(true);
    lastRefreshRef.current = now;
    lastActiveRef.current = now;
    lastThrottleRef.current = now;
    wasAwayRef.current = false;
    awaySinceRef.current = 0;

    if (onRefresh) {
      onRefresh();
    }

    try {
      router.refresh();
    } finally {
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
    wasAwayRef.current = false;
    awaySinceRef.current = 0;
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

    // If the timeout elapsed while on the page, do not auto-refresh while the user is using it.
    // Instead, notify the user that fresh updates are available.
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

    const markAway = () => {
      wasAwayRef.current = true;
      awaySinceRef.current = Date.now();
    };

    const handleReturn = () => {
      const now = Date.now();
      const elapsedActive =
        lastActiveRef.current > 0 ? now - lastActiveRef.current : 0;
      const elapsedAway =
        awaySinceRef.current > 0 ? now - awaySinceRef.current : 0;

      // If user returns directly after the timeout has elapsed, auto-refresh the app
      if (
        wasAwayRef.current &&
        (elapsedActive >= timeoutMs || elapsedAway >= timeoutMs)
      ) {
        executeRefresh();
      } else {
        // Tab restored before timeout: continue normally
        wasAwayRef.current = false;
        awaySinceRef.current = 0;
        if (lastActiveRef.current === 0) {
          lastActiveRef.current = now;
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markAway();
      } else if (document.visibilityState === 'visible') {
        handleReturn();
      }
    };

    const handleBlur = () => {
      markAway();
    };

    const handleFocus = () => {
      handleReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Heartbeat check for tabs left open and visible without user interaction
    // When the user is currently on the page, DO NOT auto-refresh; show the prompt instead.
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
    }, 30_000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [executeRefresh, recordActivity, timeoutMs]);

  return {
    needsRefresh,
    isRefreshing,
    refresh: executeRefresh,
    dismiss,
  };
}
