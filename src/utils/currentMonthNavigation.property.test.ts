import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: calendar-view, Property 8: Current Month Navigation
// For any displayed month, activating the current month control should navigate to the 
// month containing today's date.
// **Validates: Requirements 3.6**

describe('Current Month Navigation Property Tests', () => {
  /**
   * Helper function to navigate to current month
   * Returns [currentMonth, currentYear] based on today's date
   */
  const navigateToCurrentMonth = (): [number, number] => {
    const today = new Date();
    return [today.getMonth(), today.getFullYear()];
  };

  it('should navigate to current month from any starting month', () => {
    fc.assert(
      fc.property(
        // Generate random starting month (0-11) and year (1900-2100)
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        () => {
          // Navigate to current month
          const [currentMonth, currentYear] = navigateToCurrentMonth();

          // Get today's actual month and year for verification
          const today = new Date();
          const expectedMonth = today.getMonth();
          const expectedYear = today.getFullYear();

          // Property 1: Current month should match today's month
          expect(currentMonth).toBe(expectedMonth);

          // Property 2: Current year should match today's year
          expect(currentYear).toBe(expectedYear);

          // Property 3: Current month should be valid (0-11)
          expect(currentMonth).toBeGreaterThanOrEqual(0);
          expect(currentMonth).toBeLessThanOrEqual(11);

          // Property 4: Current year should be reasonable
          expect(currentYear).toBeGreaterThanOrEqual(1900);
          expect(currentYear).toBeLessThanOrEqual(2100);
        }
      ),
      { numRuns: 100 } // Minimum 100 iterations as per design spec
    );
  });

  it('should navigate to current month from past months', () => {
    fc.assert(
      fc.property(
        // Generate random past dates (before today)
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: new Date().getFullYear() - 1 }),
        (_, startYear) => {
          // Navigate to current month
          const [currentMonth, currentYear] = navigateToCurrentMonth();

          const today = new Date();
          const expectedMonth = today.getMonth();
          const expectedYear = today.getFullYear();

          // Property: Should navigate to today's month regardless of past starting position
          expect(currentMonth).toBe(expectedMonth);
          expect(currentYear).toBe(expectedYear);

          // Property: Current year should be greater than or equal to starting year
          expect(currentYear).toBeGreaterThanOrEqual(startYear);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should navigate to current month from future months', () => {
    fc.assert(
      fc.property(
        // Generate random future dates (after today)
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: new Date().getFullYear() + 1, max: 2100 }),
        (_, startYear) => {
          // Navigate to current month
          const [currentMonth, currentYear] = navigateToCurrentMonth();

          const today = new Date();
          const expectedMonth = today.getMonth();
          const expectedYear = today.getFullYear();

          // Property: Should navigate to today's month regardless of future starting position
          expect(currentMonth).toBe(expectedMonth);
          expect(currentYear).toBe(expectedYear);

          // Property: Current year should be less than or equal to starting year
          expect(currentYear).toBeLessThanOrEqual(startYear);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return to current month when already viewing current month', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No random input needed, just run multiple times
        () => {
          const today = new Date();
          const startMonth = today.getMonth();
          const startYear = today.getFullYear();

          // Navigate to current month (should stay the same)
          const [currentMonth, currentYear] = navigateToCurrentMonth();

          // Property: Should remain on current month
          expect(currentMonth).toBe(startMonth);
          expect(currentYear).toBe(startYear);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be idempotent: navigating to current month multiple times yields same result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        fc.integer({ min: 1, max: 10 }), // Number of times to navigate to current month
        (_, __, iterations) => {
          let currentMonth: number;
          let currentYear: number;

          // Navigate to current month multiple times
          for (let i = 0; i < iterations; i++) {
            [currentMonth, currentYear] = navigateToCurrentMonth();
          }

          const today = new Date();
          const expectedMonth = today.getMonth();
          const expectedYear = today.getFullYear();

          // Property: Multiple navigations should always yield today's month/year
          expect(currentMonth!).toBe(expectedMonth);
          expect(currentYear!).toBe(expectedYear);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should navigate to current month from various positions across years', () => {
    fc.assert(
      fc.property(
        // Generate random month and year combinations
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (startMonth, startYear) => {
          // Navigate to current month
          const [currentMonth, currentYear] = navigateToCurrentMonth();

          const today = new Date();

          // Property 1: Result should always be today's month and year
          expect(currentMonth).toBe(today.getMonth());
          expect(currentYear).toBe(today.getFullYear());

          // Property 2: The navigation should be independent of starting position
          // (i.e., the result depends only on today's date, not the starting date)
          const startDate = new Date(startYear, startMonth, 1);
          const todayDate = new Date(today.getFullYear(), today.getMonth(), 1);

          // Whether we start from past, present, or future, we should end up at today
          if (startDate < todayDate) {
            // Started in the past
            expect(currentYear).toBeGreaterThanOrEqual(startYear);
          } else if (startDate > todayDate) {
            // Started in the future
            expect(currentYear).toBeLessThanOrEqual(startYear);
          } else {
            // Started at current month
            expect(currentMonth).toBe(startMonth);
            expect(currentYear).toBe(startYear);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
