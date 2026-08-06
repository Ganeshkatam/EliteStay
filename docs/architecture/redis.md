# Redis Distributed Caching Architecture

This document serves as the canonical reference for EliteStay's distributed state layer. It outlines the conventions, patterns, and infrastructure built around Redis.

## 1. Provider Abstraction

EliteStay does not depend directly on any specific Redis vendor or TCP client library in its feature code. Instead, all caching flows through the `CacheProvider` abstraction.

- **`UpstashProvider`**: Used in production and staging via Upstash REST API.
- **`IoRedisProvider`**: Used for local Docker-based development (`redis:7-alpine`).
- **`MemoryProvider`**: In-memory fallback used during testing or if Redis credentials are missing.

Feature code must never import `@upstash/redis` or `ioredis`. Always import `getProvider()` or use `fetchWithCache`.

## 2. The `fetchWithCache` Engine

The core caching engine (`src/lib/redis/cache.ts`) implements several enterprise resilience patterns automatically:

1. **Circuit Breaker**: If Redis fails repeatedly, the circuit opens and requests bypass Redis entirely to hit the DB directly.
2. **Request Coalescing**: If 500 identical requests hit the same Node.js process simultaneously, only _one_ Redis GET is executed. The other 499 await the shared Promise.
3. **Stampede Protection**: If a cache MISS occurs, a distributed lock is acquired before fetching from the DB to prevent hundreds of containers from querying the DB simultaneously.
4. **Stale-While-Revalidate (SWR)**: Data nearing the end of its TTL is served immediately (stale), while a background, lock-protected fetch refreshes the cache for subsequent users.
5. **Negative Caching**: Empty database results can be cached with a dedicated `negativeTtl` to prevent abuse/spam of non-existent IDs.

## 3. Cache Key Conventions

Keys must never be constructed inline as raw strings. All keys are managed via the typed `CacheKeys` builder (`src/lib/redis/keys.ts`).

### Structure

Keys follow a standard structure:
`{prefix}:{version}:{namespace}:{entity}:{id}:{hash?}`

Example: `es:v1:property:summary:123`
Example: `es:search:listings:29d8a9f...` (Search keys use their own version namespace)

### Namespace Versioning

For highly dynamic, filtered data (like search results), we use Namespace Versioning. Instead of tracking thousands of individual search keys to invalidate them, we bump the `search:version` key.
All new search keys read this version, effectively abandoning old keys which naturally expire via their TTL.

## 4. TTL Policy & Jitter

Synchronized cache expiration causes database stampedes. To prevent this, EliteStay applies **TTL Jitter** automatically.

- If you request a TTL of 3600 seconds, `withJitter()` will apply a +/- 10% randomization.
- The actual TTL will land somewhere between 3240s and 3960s.
- This ensures that if 1000 properties are cached at exactly midnight, they don't all expire at exactly 1:00 AM.

## 5. Invalidation Strategy

EliteStay favors **Event-Driven Invalidation** over TTL-based expiration for core entities.

1. **Explicit Deletion**: When a single entity updates (e.g., a Property), delete its specific key (`v1:property:summary:{id}`).
2. **Namespace Bumping**: When global data changes (e.g., a new listing is published affecting all search results), bump the namespace version (`search:version`).
3. **Natural Expiration**: Old, unused keys from namespace bumps or abandoned searches are automatically evicted by Redis based on their TTL.

## 6. When Developers Should (and Shouldn't) Cache Data

### DO Cache:

- Read-heavy, slowly changing data (Property Summaries, Categories).
- Computationally expensive queries (Search Aggregations).
- Third-party API responses with rate limits.
- Publicly accessible catalog data.

### DO NOT Cache:

- Highly transactional, user-specific data (Shopping Cart, Active Booking Session).
- Sensitive PII (unless explicitly required and encrypted).
- Write-heavy counters (use Redis `INCR` directly instead of `fetchWithCache`).
- Data that requires strong consistency constraints (e.g., Double-booking prevention—use Postgres transactions for the source of truth).
