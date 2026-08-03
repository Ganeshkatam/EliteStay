/**
 * Utility functions for capturing high-precision CPU usage, memory consumption, and duration timers
 * with safe environment checks across Node.js, Next.js Edge, and Browser environments.
 */

export interface ResourceTracker {
  startTimer: number;
  startMemoryMB: number;
  startCpu: { user: number; system: number } | null;
}

export interface ResourceDiff {
  durationMs: number;
  memoryBeforeMB: number;
  memoryAfterMB: number;
  memoryDeltaMB: number;
  cpuUserMs: number;
  cpuSystemMs: number;
}

/**
 * Returns current heap memory usage in Megabytes (MB), rounded to 2 decimal places.
 */
export function getMemoryConsumptionMB(): number {
  if (
    typeof process !== 'undefined' &&
    typeof process.memoryUsage === 'function'
  ) {
    const mem = process.memoryUsage();
    return Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100;
  }
  return 0;
}

/**
 * Returns current high-precision CPU time usage in microseconds, if available.
 */
export function getCpuUsage(): { user: number; system: number } | null {
  if (
    typeof process !== 'undefined' &&
    typeof process.cpuUsage === 'function'
  ) {
    return process.cpuUsage();
  }
  return null;
}

/**
 * Starts a resource measurement snapshot tracking time, RAM, and CPU.
 */
export function beginResourceTracking(): ResourceTracker {
  return {
    startTimer:
      typeof performance !== 'undefined' ? performance.now() : Date.now(),
    startMemoryMB: getMemoryConsumptionMB(),
    startCpu: getCpuUsage(),
  };
}

/**
 * Concludes a resource measurement snapshot, computing elapsed milliseconds and delta memory/CPU consumption.
 */
export function endResourceTracking(tracker: ResourceTracker): ResourceDiff {
  const now =
    typeof performance !== 'undefined' ? performance.now() : Date.now();
  const durationMs = Math.max(
    0,
    Math.round((now - tracker.startTimer) * 10) / 10
  );

  const memoryAfterMB = getMemoryConsumptionMB();
  const memoryDeltaMB =
    Math.round((memoryAfterMB - tracker.startMemoryMB) * 100) / 100;

  let cpuUserMs = 0;
  let cpuSystemMs = 0;

  if (
    tracker.startCpu &&
    typeof process !== 'undefined' &&
    typeof process.cpuUsage === 'function'
  ) {
    const diff = process.cpuUsage(tracker.startCpu);
    cpuUserMs = Math.round(diff.user / 1000);
    cpuSystemMs = Math.round(diff.system / 1000);
  }

  return {
    durationMs,
    memoryBeforeMB: tracker.startMemoryMB,
    memoryAfterMB,
    memoryDeltaMB,
    cpuUserMs,
    cpuSystemMs,
  };
}
