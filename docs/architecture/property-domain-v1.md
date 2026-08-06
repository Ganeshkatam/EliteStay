# Property Domain v1 (Frozen)

This document formally declares the **Property Domain Read Model** as `v1` and structurally **frozen**.

## What is Frozen?

- **API Contracts**: The interfaces returned by `PropertyRepository` and all Domain Services (`PropertyBaseService`, `MediaService`, `HostService`, `AmenitiesService`, `PricingService`, `ReviewService`).
- **Repository Interfaces**: The direct mapping between Supabase SQL/RPCs and the standard returned data shapes.
- **Cache Ownership**: The Redis keys and caching logic established in Phase 1 (`property:base`, `property:media`, etc.) are owned strictly by this domain.
- **Streaming Boundaries**: The UI composition using Suspense, Error Boundaries (`PropertySectionErrorBoundary`), and the top-level route extraction logic.
- **Observability**: The two-layer instrumentation (Repository metrics and Service hit/miss metrics).

## Architectural Implication for Phase 3 (Booking)

The Booking Domain is a **consumer** of the Property Domain. Booking must **not** modify Property Domain services, repositories, or cache logic to accommodate write-heavy workflows.

If Booking requires property data (e.g., for pricing snapshots or availability checks), it must consume the stable interfaces provided by `PropertyDomain v1`, or build its own dedicated views (`PricingRepository`, `AvailabilityRepository`) within the Booking bounded context.

This prevents the common anti-pattern where transactional booking logic leaks into read-heavy property presentation services.
