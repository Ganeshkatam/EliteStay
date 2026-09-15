'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CHECK_INTERVAL_MS = 3 * 60 * 1000; // Check every 3 minutes

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const initialVersionRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function queryVersion() {
      try {
        const res = await fetch(`/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (!res.ok || isCancelled) return;

        const data = await res.json();
        const currentServerVersion = data?.version;

        if (!currentServerVersion || isCancelled) return;

        if (initialVersionRef.current === null) {
          // Record initial version on initial app load
          initialVersionRef.current = currentServerVersion;
        } else if (initialVersionRef.current !== currentServerVersion) {
          // Newer build detected on the server
          setLatestVersion(currentServerVersion);
          setUpdateAvailable(true);
        }
      } catch {
        // Network errors or offline states ignored gracefully
      }
    }

    // Schedule initial check after hydration
    const initialTimer = setTimeout(() => {
      queryVersion();
    }, 1500);

    const intervalId = setInterval(queryVersion, CHECK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryVersion();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', queryVersion);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', queryVersion);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  return {
    updateAvailable: updateAvailable && !isDismissed,
    latestVersion,
    applyUpdate,
    dismiss,
  };
}
