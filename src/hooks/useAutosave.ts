import { useState, useEffect, useCallback, useRef } from 'react';
import { AutosaveStatus } from '@/features/host/publishing/view-models/listing-publishing.viewmodel';

interface UseAutosaveOptions {
  debounceMs?: number;
  maxRetries?: number;
}

export function useAutosave<T>(
  saveFn: (data: T) => Promise<void>,
  options: UseAutosaveOptions = {}
) {
  const { debounceMs = 1500, maxRetries = 3 } = options;

  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastAttemptAt, setLastAttemptAt] = useState<Date | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const executeSaveRef = useRef<(data: T, isRetry?: boolean) => Promise<void>>(
    async () => {}
  );

  const executeSave = useCallback(
    async (data: T, isRetry = false) => {
      if (!isMountedRef.current) return;
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      setStatus(isRetry ? 'retrying' : 'saving');
      setLastAttemptAt(new Date());

      try {
        await saveFn(data);
        if (!isMountedRef.current) return;

        setStatus('saved');
        setLastSavedAt(new Date());
        retryCountRef.current = 0;
        pendingDataRef.current = null;

        // Reset to idle after a few seconds of 'saved' status
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
          }
        }, 3000);
      } catch {
        if (!isMountedRef.current) return;

        if (retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          setStatus('failed');
          // Auto-retry with backoff
          timeoutRef.current = setTimeout(
            () => {
              if (isMountedRef.current) {
                executeSaveRef.current(data, true);
              }
            },
            Math.min(1000 * Math.pow(2, retryCountRef.current), 10000)
          );
        } else {
          setStatus('failed');
        }
      }
    },
    [saveFn, maxRetries]
  );
  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  useEffect(() => {
    isMountedRef.current = true;
    const handleOnline = () => {
      if (status === 'offline' && pendingDataRef.current) {
        setStatus('retrying');
        executeSave(pendingDataRef.current);
      }
    };
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, executeSave]);

  const save = useCallback(
    (data: T) => {
      pendingDataRef.current = data;
      setStatus('dirty');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        executeSave(data);
      }, debounceMs);
    },
    [executeSave, debounceMs]
  );

  const markDirty = useCallback(() => {
    setStatus('dirty');
  }, []);

  const retry = useCallback(() => {
    if (pendingDataRef.current) {
      retryCountRef.current = 0;
      executeSave(pendingDataRef.current, true);
    }
  }, [executeSave]);

  return {
    status,
    lastSavedAt,
    lastAttemptAt,
    save,
    markDirty,
    retry,
  };
}
