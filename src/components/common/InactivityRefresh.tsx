'use client';

import {
  useInactivityRefresh,
  UseInactivityRefreshOptions,
} from '@/hooks/useInactivityRefresh';

export type InactivityRefreshProps = UseInactivityRefreshOptions;

/**
 * InactivityRefresh
 *
 * Client component that monitors user inactivity (tab focus, page visibility,
 * and user interactions). When inactivity exceeds the specified threshold (default 30 min),
 * it performs a silent Next.js router refresh to revalidate server component state
 * without disrupting active text fields or causing a blank screen flash.
 */
export function InactivityRefresh(props: InactivityRefreshProps) {
  useInactivityRefresh(props);
  return null;
}
