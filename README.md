# EliteStay

> **A modern long-term accommodation platform that connects residents and property owners while managing the complete tenancy lifecycle through a unified digital platform.**

EliteStay is not a short-term travel or vacation booking site. It is a full-stack real estate and residency ecosystem designed to digitize the entire lifecycle of long-term accommodation.

---

## The Resident Journey

EliteStay continues managing the relationship long after the initial booking is made:

1. **Property Discovery** (Search, Compare, Map Views)
2. **Rental Application** (Background Checks, References, Viewing Requests)
3. **Host Review** (Application Approval/Rejection)
4. **Reservation** (Lease Signing, Security Deposits)
5. **Move-In** (Inventory Checks, Readiness)
6. **Resident Operations** (Active Tenancy, Portal Access)
7. **Rent & Maintenance** (Recurring Billing, Service Requests)
8. **Move-Out / Renewal** (Lease Lifecycle Management)

---

## Architectural Bounded Contexts

EliteStay is organized into distinct domain-driven bounded contexts:

- **Identity**: Authentication, Core Profiles, Resident Profiles
- **Location**: Countries, States, Cities, Localities
- **Listings**: Listings, Pricing, Availability, Amenities, Media, Rules
- **Discovery**: Search, Recommendations, Homepage
- **Applications**: Rental Applications, Applicant Profiles, Viewing Requests
- **Reservation**: Reservations, Initial Payments, Move-In Readiness
- **Tenancy**: Active Leases, Lease Renewals, Resident Portals, Maintenance Requests
- **Host**: Operational Dashboard, Business Governance, Performance, Vendor Management

---

## Tech Stack & Core Infrastructure

EliteStay utilizes a highly scalable, modern web architecture:

- **Framework**: Next.js (App Router) with React 19
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **Styling**: Tailwind CSS (Utility-first, structured Design System)
- **Caching**: Redis (Event-Driven Invalidation Subsystem)
- **State Management**: React Server Components & Server Actions (Thin Route Architecture)

### Key Engineering Principles (FROZEN)

1. **Thin Route Rule**: Next.js route files (`page.tsx`, `layout.tsx`) only authenticate sessions, authorize access, invoke orchestration services, and render UI. They **never** contain business logic or raw database queries.
2. **Strict Repository Pattern**: Database access flows strictly through Repositories. UI components never call Supabase directly.
3. **Unified Cache Facade**: All caching operates through a unified `Cache` facade using a configuration-driven `CacheManifest`. No manual TTL or invalidation logic exists in business services.
4. **Observability**: Execution paths are heavily instrumented via the Observability platform (Tracing, Metrics, Auditing).
5. **No Service Roles in Client**: The Supabase `service_role` key never exists outside trusted server infrastructure. RLS is strictly enforced.

---

## Getting Started

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Ensure you have your local Supabase variables configured in `.env.local` to connect to the backend infrastructure.

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run lint`: Run ESLint validation
- `npm run typecheck`: Run TypeScript compilation check
- `npm run format`: Format codebase using Prettier

---

## Current Status

**Phase 6 (Core Platform Foundation) is complete.** The platform has successfully transitioned from a discovery marketplace into a full-scale operations platform capable of managing the tenant lifecycle.

**Next Up: Phase 7 (Vendor & Maintenance Management)** - Introducing workflows for third-party vendors, maintenance requests, and host ecosystem integrations.
