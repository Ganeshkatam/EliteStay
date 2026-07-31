import { describe, it, expect } from 'vitest';
import { calculateBookingTotal, validateMinimumStay } from '../utils/pricing';

describe('Pricing Calculations', () => {
  it('calculates the correct total for a valid booking', () => {
    const result = calculateBookingTotal(1000, 500, 3);
    
    expect(result.monthlyRent).toBe(1000);
    expect(result.securityDeposit).toBe(500);
    expect(result.months).toBe(3);
    expect(result.totalRent).toBe(3000);
    expect(result.platformFee).toBe(150); // 5% of 3000
    expect(result.totalAmount).toBe(3650); // 3000 + 500 + 150
  });

  it('throws an error if months is less than 1', () => {
    expect(() => calculateBookingTotal(1000, 500, 0)).toThrow('Booking must be at least 1 month');
  });
});

describe('Minimum Stay Validation', () => {
  it('returns true if the stay is longer than the minimum', () => {
    const start = '2026-08-01';
    const end = '2026-11-01'; // ~3 months
    
    expect(validateMinimumStay(start, end, 2)).toBe(true);
  });

  it('returns false if the stay is shorter than the minimum', () => {
    const start = '2026-08-01';
    const end = '2026-08-15'; // ~0.5 months
    
    expect(validateMinimumStay(start, end, 1)).toBe(false);
  });
});
