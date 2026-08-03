/**
 * Generates universally unique correlation IDs for distributed traces, spans, and request logs.
 */

export function generateCorrelationId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Safe fallback for legacy or constrained runtimes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Shortens a full UUID into an 8-character compact span identifier for visual logs and CLI summaries.
 */
export function generateSpanId(): string {
  return (
    generateCorrelationId().split('-')[0] ||
    Math.random().toString(16).slice(2, 10)
  );
}
