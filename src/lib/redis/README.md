# EliteStay Redis Platform Architecture

The Redis Platform serves as the distributed state and performance layer for the EliteStay application. Following Phase 1.5 completion, the platform strictly enforces a unified cache abstraction over Upstash Serverless Redis.

## Core Architecture Principles

1. **Facade Pattern**: Consumers must only interact with `CacheFacade`. Direct interaction with `@upstash/redis` or key building logic is strictly forbidden.
2. **Data-Driven Manifest**: All cache keys, tagging strategies, and caching policies are defined declaratively in `CacheManifest`.
3. **Event-Driven Invalidation**: The platform uses a tagging mechanism (`tag:<name>`) backed by Redis Sets to group related keys. Cache invalidation is triggered asynchronously via `CacheEventRegistry` listening to the domain `eventBus`.
4. **Resiliency First**: The subsystem is protected by a Circuit Breaker pattern. If Redis becomes unresponsive, the system gracefully falls back to direct database reads without crashing the application.
5. **Observability**: Every single cache operation is instrumented via `observability/metrics.ts` to track Hits, Misses, Stale Serves, and Latencies.

---

## 1. Request Flow (Read)

```mermaid
sequenceDiagram
    participant Client
    participant Service
    participant CacheFacade
    participant CircuitBreaker
    participant Redis
    participant Database

    Client->>Service: Request Data
    Service->>CacheFacade: Cache.fetch(CacheManifest.property(id), fetcher)

    CacheFacade->>CircuitBreaker: check()

    alt Circuit OPEN
        CircuitBreaker-->>CacheFacade: Fallback to DB
        CacheFacade->>Database: fetcher()
        Database-->>CacheFacade: Data
    else Circuit CLOSED
        CacheFacade->>Redis: GET "elitestay:v1:property:123"
        Redis-->>CacheFacade: Cache Envelope (Data)

        alt Cache HIT (Fresh)
            CacheFacade-->>Service: Data
        else Cache HIT (Stale-While-Revalidate)
            CacheFacade-->>Service: Data (Stale)
            CacheFacade--)Database: Async fetcher()
            Database--)Redis: Async SET (Fresh)
        else Cache MISS
            CacheFacade->>Database: fetcher()
            Database-->>CacheFacade: Data
            CacheFacade->>Redis: SET "elitestay:v1:property:123" Data
            CacheFacade->>Redis: SADD "tag:property:123" "elitestay:v1:property:123"
            CacheFacade-->>Service: Data
        end
    end

    Service-->>Client: Response
```

---

## 2. Event-Driven Invalidation Flow

The platform relies on tags to invalidate multiple granular keys associated with a business entity. When a business event occurs, the cache registry maps the event to specific tags.

```mermaid
sequenceDiagram
    participant Host
    participant DomainLogic
    participant EventBus
    participant EventRegistry
    participant Redis

    Host->>DomainLogic: Update Listing Price
    DomainLogic->>Database: UPDATE listing...
    DomainLogic->>EventBus: publish(LISTING_PUBLISHED, payload)
    EventBus--)EventRegistry: handleEvent()

    EventRegistry->>EventRegistry: resolve tags (e.g. ['property:123', 'search'])

    loop For Each Tag
        EventRegistry->>Redis: SMEMBERS "tag:property:123"
        Redis-->>EventRegistry: ["key1", "key2"]
        EventRegistry->>Redis: DEL "key1" "key2"
        EventRegistry->>Redis: DEL "tag:property:123"
    end
```

---

## 3. Distributed Lock Architecture

The platform provides a `Cache.lock()` method to acquire distributed locks, primarily used to prevent booking race conditions or stampeding herds on expensive calculations.

```mermaid
sequenceDiagram
    participant Client A
    participant Client B
    participant Redis

    Client A->>Redis: SETNX lock:booking:456 <uuid-A> PX 10000
    Redis-->>Client A: OK (Acquired)

    Client B->>Redis: SETNX lock:booking:456 <uuid-B> PX 10000
    Redis-->>Client B: 0 (Failed)

    Client A->>Database: INSERT Booking...

    Client A->>Redis: GET lock:booking:456
    Redis-->>Client A: <uuid-A>
    Client A->>Redis: DEL lock:booking:456
```

---

## 4. Module Dependency Structure

```mermaid
graph TD
    Consumer(Domain Services) --> Facade(Cache Facade)

    Facade --> Manifest(Cache Manifest)
    Facade --> Engine(Cache Engine)
    Facade --> Invalidation(Invalidation Engine)
    Facade --> Lock(Distributed Locks)

    Engine --> Policy(Policy Registry)
    Engine --> Serializer(Serializer / Brotli)
    Engine --> Breaker(Circuit Breaker)

    Breaker --> Upstash(Upstash Provider)
    Breaker --> Memory(Memory Provider Fallback)

    Invalidation --> Breaker
    Lock --> Breaker

    EventBus(Event Bus) -.-> EventRegistry(Event Registry)
    EventRegistry -.-> Invalidation
```

## Supported Operations

| Operation       | Description                                                                              | Concurrency safe? |
| --------------- | ---------------------------------------------------------------------------------------- | ----------------- |
| `fetch`         | Gets a value, falling back to database fetcher on miss. Protects against cache stampede. | ✅ Yes            |
| `get`           | Directly retrieves a value. Returns null on miss.                                        | ✅ Yes            |
| `set`           | Directly sets a value. Supports tagging and TTL policies.                                | ✅ Yes            |
| `deleteKey`     | Directly deletes a key.                                                                  | ✅ Yes            |
| `invalidateTag` | Deletes all keys associated with a tag and cleans up the set.                            | ✅ Yes            |
| `lock`          | Acquires a distributed lock.                                                             | ✅ Yes            |
| `releaseLock`   | Releases a distributed lock via ownership check.                                         | ✅ Yes            |
