/**
 * TTL Utilities -- jitter and named constants.
 */

import { TTL_JITTER_FRACTION } from './config';

/**
 * Apply jitter to a base TTL to prevent bulk key expirations.
 *
 * @param baseTTL   Base TTL in seconds.
 * @param fraction  Jitter fraction (default from config, 0.15 = +/- 15%).
 * @returns         TTL with random jitter applied, minimum 1 second.
 */
export function withJitter(
  baseTTL: number,
  fraction: number = TTL_JITTER_FRACTION
): number {
  const range = Math.floor(baseTTL * fraction);
  const jitter = Math.floor(Math.random() * (range * 2 + 1)) - range;
  return Math.max(1, baseTTL + jitter);
}
