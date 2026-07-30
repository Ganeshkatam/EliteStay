import { describe, it, expect } from 'vitest';
import {
  canTransitionBookingRequest,
  canTransitionStay,
  ActorRole,
} from './transitions';

describe('Booking Transitions Engine', () => {
  describe('Guest Transitions (Booking Request)', () => {
    const role: ActorRole = 'guest';

    it('can cancel a pending booking request', () => {
      expect(canTransitionBookingRequest('pending', 'cancelled', role)).toBe(
        true
      );
    });

    it('cannot perform unauthorized transitions', () => {
      expect(canTransitionBookingRequest('pending', 'approved', role)).toBe(
        false
      );
    });
  });

  describe('Host Transitions (Booking Request)', () => {
    const role: ActorRole = 'host';

    it('can approve, reject or cancel a pending booking request', () => {
      expect(canTransitionBookingRequest('pending', 'approved', role)).toBe(
        true
      );
      expect(canTransitionBookingRequest('pending', 'rejected', role)).toBe(
        true
      );
      expect(canTransitionBookingRequest('pending', 'cancelled', role)).toBe(
        true
      );
    });

    it('cannot perform unauthorized transitions', () => {
      expect(canTransitionBookingRequest('cancelled', 'approved', role)).toBe(
        false
      );
    });
  });
});

describe('Stay Transitions Engine', () => {
  describe('Guest Transitions (Stay)', () => {
    const role: ActorRole = 'guest';

    it('can terminate an upcoming stay', () => {
      expect(canTransitionStay('upcoming', 'terminated', role)).toBe(true);
    });

    it('cannot perform unauthorized transitions', () => {
      expect(canTransitionStay('active', 'completed', role)).toBe(false);
    });
  });

  describe('Host Transitions (Stay)', () => {
    const role: ActorRole = 'host';

    it('can mark an upcoming stay as active or terminated', () => {
      expect(canTransitionStay('upcoming', 'active', role)).toBe(true);
      expect(canTransitionStay('upcoming', 'terminated', role)).toBe(true);
    });

    it('can extend or complete an active stay', () => {
      expect(canTransitionStay('active', 'extended', role)).toBe(true);
      expect(canTransitionStay('active', 'completed', role)).toBe(true);
    });

    it('cannot perform unauthorized transitions', () => {
      expect(canTransitionStay('upcoming', 'completed', role)).toBe(false);
    });
  });

  describe('Admin Transitions (Stay)', () => {
    const role: ActorRole = 'admin';

    it('can terminate an active or extended stay', () => {
      expect(canTransitionStay('active', 'terminated', role)).toBe(true);
      expect(canTransitionStay('extended', 'terminated', role)).toBe(true);
    });
  });
});
