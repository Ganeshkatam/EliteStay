/**
 * Circuit Breaker -- three-state protection against Redis failures.
 *
 * States:
 *   CLOSED     ->  Redis is healthy. All operations go through Redis.
 *   OPEN       ->  Redis is degraded. Skip Redis entirely, fall back to DB.
 *   HALF_OPEN  ->  Probing. Allow a single request through to test recovery.
 *
 * Thresholds and cooldown are sourced from `config.ts`.
 *
 * Emits observability events on state transitions.
 */

import {
  CIRCUIT_FAILURE_THRESHOLD,
  CIRCUIT_COOLDOWN_MS,
  CIRCUIT_HALF_OPEN_REQUESTS,
} from './config';
import { recordBusinessEvent } from '@/lib/observability';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state: CircuitState = 'CLOSED';
let consecutiveFailures = 0;
let lastFailureTime = 0;
let halfOpenSuccesses = 0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return the current circuit state. */
export function getCircuitState(): CircuitState {
  if (state === 'OPEN') {
    // Check if cooldown has elapsed -- transition to HALF_OPEN
    const elapsed = Date.now() - lastFailureTime;
    if (elapsed >= CIRCUIT_COOLDOWN_MS) {
      transition('HALF_OPEN');
    }
  }
  return state;
}

/** Whether Redis operations should be attempted. */
export function isCircuitClosed(): boolean {
  const current = getCircuitState();
  return current === 'CLOSED' || current === 'HALF_OPEN';
}

/** Record a successful Redis operation. */
export function recordSuccess(): void {
  if (state === 'HALF_OPEN') {
    halfOpenSuccesses++;
    if (halfOpenSuccesses >= CIRCUIT_HALF_OPEN_REQUESTS) {
      transition('CLOSED');
    }
  } else if (state === 'CLOSED') {
    consecutiveFailures = 0;
  }
}

/** Record a failed Redis operation. */
export function recordFailure(): void {
  consecutiveFailures++;
  lastFailureTime = Date.now();

  if (state === 'HALF_OPEN') {
    // Probe failed -- reopen immediately
    transition('OPEN');
  } else if (
    state === 'CLOSED' &&
    consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD
  ) {
    transition('OPEN');
  }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function transition(newState: CircuitState): void {
  const oldState = state;
  state = newState;

  if (newState === 'CLOSED') {
    consecutiveFailures = 0;
    halfOpenSuccesses = 0;
  } else if (newState === 'HALF_OPEN') {
    halfOpenSuccesses = 0;
  }

  recordBusinessEvent('redis.circuit_breaker.transition', {
    from: oldState,
    to: newState,
    consecutiveFailures: String(consecutiveFailures),
  });
}

/**
 * Reset circuit breaker state. Intended for tests only.
 * @internal
 */
export function _resetCircuitForTesting(): void {
  state = 'CLOSED';
  consecutiveFailures = 0;
  lastFailureTime = 0;
  halfOpenSuccesses = 0;
}
