# Booking Domain Architecture

This document defines the architectural boundaries, responsibilities, and flows for the EliteStay Booking Domain.

## 1. Aggregate

**Booking**
The Booking aggregate is the transactional boundary. It owns:

- reservation state
- pricing snapshot
- guest snapshot
- payment reference

## 2. Entities

- **BookingIntent**: Ephemeral data structure capturing user intent before persistence.
- **Reservation**: The core persistent entity representing a booking.
- **Guest**: The user associated with the reservation.
- **Payment**: The record of payment authorization and capture.
- **AvailabilityWindow**: A specific date range block for a property.

## 3. State Machine

The reservation lifecycle strictly follows this explicit state machine. Never allow implicit transitions.

```
DRAFT
  ↓
VALIDATED
  ↓
LOCKED
  ↓
PENDING_PAYMENT
  ↓
CONFIRMED
```

**Failure States:**

- `FAILED`
- `EXPIRED`
- `CANCELLED`
- `REFUNDED`

## 4. Events

Every mutation emits a domain event. These events feed notifications, analytics, cache invalidation, emails, and webhooks without coupling services together.

- `BookingDraftCreated`
- `AvailabilityValidated`
- `LockAcquired`
- `ReservationCreated`
- `PaymentAuthorized`
- `BookingConfirmed`
- `BookingCancelled`

## 5. Booking Intent

The `BookingIntent` flows through the entire booking pipeline to avoid huge parameter lists across services. It contains:

- `propertyId`
- `checkIn`
- `checkOut`
- `guests`
- `currency`
- `locale`
- `promotionCode`
- `source`

## 6. Repository Layer

Repositories own data access. Services own business rules.

```
BookingRepository
       ↓
AvailabilityRepository
       ↓
PricingRepository
       ↓
PaymentRepository
```

## 7. Availability

Do **not** cache yet. Correctness comes first. Only after the booking lifecycle is stable should Redis begin caching availability.

```
Booking
  ↓
AvailabilityRepository
  ↓
Database
  ↓
Validation
```

## 8. Pricing

Pricing becomes immutable after validation. Never continue reading live pricing after reservation creation to prevent inconsistent bookings if a host changes prices mid-checkout.

```
Current Price
  ↓
Validate
  ↓
Snapshot
  ↓
Reservation
```

## 9. Distributed Lock

Your Redis layer coordinates the distributed lock during the checkout phase.

- **Lock Key:** `lock:property:{propertyId}:checkIn:{checkIn}:checkOut:{checkOut}`
- **Store:** owner token, expiration
- **Release:** compare-and-delete release (never release by key alone)

## 10. Cache Invalidation

Booking never calls Redis directly for cache invalidation.

```
BookingConfirmed
  ↓
Event
  ↓
AvailabilityInvalidator
  ↓
Redis
```
