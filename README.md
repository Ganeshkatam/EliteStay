# EliteStay

EliteStay is a full-stack, enterprise-grade living accommodation platform designed to connect residents with property owners and manage the complete tenancy lifecycle through a unified digital platform.

Unlike short-term vacation rental sites, EliteStay is engineered specifically for verified long-term stays, student housing, co-living spaces, and residential accommodation.

---

## Key Platform Features

### Resident Journey

- **Discovery & Search**: High-performance listing search, map-based radius discovery, and accommodation category filtering (apartments, co-living, student housing, villas).
- **Rental Applications**: Streamlined digital rental applications, tenant background profiling, references, and in-person or virtual viewing requests.
- **Reservations & Booking**: Integrated booking workflows, lease signing, and security deposit management.
- **Resident Portal**: Move-in inventory verification, digital lease records, recurring rental payments, and maintenance requests.

### Host Operations

- **Operational Dashboard**: Centralized dashboard for occupancy metrics, booking requests, and revenue tracking.
- **Listings Management**: Multi-step accommodation publishing workflow with image management, pricing rules, amenities, and room availability.
- **Calendar & Availability**: Visual availability scheduling, booking approvals, and check-in coordination.
- **Resident Management**: Active lease oversight, renewal notices, and communication threads.

---

## Architecture & Engineering Standards

EliteStay follows Domain-Driven Design (DDD) principles with clear bounded contexts and strict architectural boundaries:

```
src/
├── app/                  # Next.js App Router (thin route orchestration)
├── components/           # Shared presentation components and UI primitives
├── config/               # Centralized configuration and environment schemas
├── features/             # Domain modules
│   ├── auth/             # Authentication and session management
│   ├── bookings/         # Booking domain and reservation state machine
│   ├── guest/            # Guest discovery, home feeds, and catalog views
│   ├── host/             # Host portal, onboarding, publishing, and workspace
│   ├── listings/         # Listing domain, pricing, and availability
│   ├── location/         # Geographic hierarchy (cities, localities, coordinates)
│   ├── messaging/        # Resident-Host messaging subsystem
│   ├── notifications/    # Multi-channel notification pipeline
│   ├── property/         # Property aggregate, reviews, and media presentation
│   ├── resident/         # Resident tenancy portal and lease operations
│   └── search/           # Discovery facade, filters, and map integration
├── lib/                  # Cross-cutting platform infrastructure
│   ├── config/           # App, search, notification, and observability configs
│   ├── observability/    # Tracing, structured logging, and metrics
│   ├── redis/            # Distributed caching facade and invalidation
│   ├── security/         # Rate limiting, CSRF, and authorization policies
│   └── supabase/         # Typed database client and server helpers
└── types/                # Shared domain contracts and database types
```

### Core Architecture Rules

1. **Thin Route Architecture**: Next.js route handlers and page components (`page.tsx`, `layout.tsx`) serve strictly as orchestration layers. They verify session access, invoke domain services, and render presentation components. Business logic and raw SQL queries never reside in routes.
2. **Repository Pattern**: All database interaction flows through dedicated repositories. Presentation components never query Supabase directly.
3. **Unified Caching Subsystem**: Redis caching operates via a unified `Cache` facade using declarative cache manifests and event-driven invalidation. Services do not manage manual TTLs or raw cache keys directly.
4. **Comprehensive Observability**: Cross-cutting instrumentation provides distributed tracing, slow-query detection, N+1 query alerting, and performance metrics without polluting domain logic.
5. **Security & Least Privilege**: Row Level Security (RLS) is enforced across every database table with default-deny policies. The Supabase `service_role` key is never exposed to the client or untrusted environments.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) with [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Caching**: [Redis](https://redis.io/) (Standard TCP/TLS connection string, Upstash, or local Docker)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Radix UI and Base UI primitives
- **Maps**: MapLibre GL and React Map GL
- **State & Workflow**: XState state machines
- **Testing**: Vitest, React Testing Library, and Playwright
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks

---

## Getting Started

### Prerequisites

- **Node.js**: v20.x or v22.x LTS (Node 22 recommended)
- **npm**: v10.x or higher
- **Supabase**: Active Supabase project or local Supabase CLI instance
- **Redis**: Redis instance (local Docker container or managed Redis like Upstash)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ganeshkatam/EliteStay.git
   cd EliteStay
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Configure environment variables:
   Copy the example environment template to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

4. Populate `.env.local` with your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable/anon API key.
   - `REDIS_URL`: Your Redis connection URI (e.g., `redis://localhost:6379` or `rediss://...`).
   - `NEXT_PUBLIC_SITE_URL`: Application base URL (default: `http://localhost:3000`).

5. Build database migration files:

   ```bash
   npm run db:build
   ```

6. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Starts the Next.js development server on port 3000                |
| `npm run build`     | Builds the optimized production application                       |
| `npm run start`     | Starts the production server after building                       |
| `npm run typecheck` | Validates TypeScript compilation across the entire project        |
| `npm run lint`      | Runs ESLint analysis on source code                               |
| `npm run format`    | Formats all code files using Prettier                             |
| `npm run test`      | Executes unit and integration test suites using Vitest            |
| `npm run db:build`  | Rebuilds the combined initial SQL migration from schema fragments |
| `npm run benchmark` | Executes Redis cache performance and resilience benchmarks        |

---

## Testing

- **Unit & Integration Tests**:

  ```bash
  npm run test
  ```

  Runs Vitest test suites covering business rules, booking policies, transitions, and auth authorization logic.

- **End-to-End & Accessibility Tests**:
  ```bash
  npx playwright test
  ```
  Executes Playwright browser suites across Chromium, Firefox, and WebKit, including automated accessibility audits with Axe Core.

---

## Security Policy

- **Row Level Security (RLS)**: Enforced on all database tables with strict default-deny.
- **Client Key Isolation**: Only client-safe anon keys (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) are bundled into the application.
- **Strict Role Verification**: Session access and capability policies are verified on the server side prior to orchestrating operations.

---

## License

This project is proprietary and confidential. All rights reserved.
