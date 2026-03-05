import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: calendar-view, Property 7: Month Navigation
// For any displayed month, activating the previous or next month controls should change 
// the displayed month to the adjacent month (previous or next respectively).
// **Validates: Requirements 3.3, 3.4**

describe('Month Navigation Property Tests', () => {
  /**
   * Helper function to navigate to previous month
   * Returns [newMonth, newYear]
   */
  const navigateToPreviousMonth = (month: number, year: number): [number, number] => {
    if (month === 0) {
      return [11, year - 1];
    } else {
      return [month - 1, year];
    }
  };

  /**
   * Helper function to navigate to next month
   * Returns [newMonth, newYear]
   */
  const navigateToNextMonth = (month: number, year: number): [number, number] => {
    if (month === 11) {
      return [0, year + 1];
    } else {
      return [month + 1, year];
    }
  };

  it('should navigate to the previous month for any starting month', () => {
    fc.assert(
      fc.property(
        // Generate random month (0-11) and year (1901-2100) to avoid going below 1900
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1901, max: 2100 }),
        (month, year) => {
          const [newMonth, newYear] = navigateToPreviousMonth(month, year);

          // Property 1: New month should be valid (0-11)
          expect(newMonth).toBeGreaterThanOrEqual(0);
          expect(newMonth).toBeLessThanOrEqual(11);

          // Property 2: New year should be valid
          expect(newYear).toBeGreaterThanOrEqual(1900);
          expect(newYear).toBeLessThanOrEqual(2100);

          // Property 3: If original month was January (0), new month should be December (11)
          // and year should decrease by 1
          if (month === 0) {
            expect(newMonth).toBe(11);
            expect(newYear).toBe(year - 1);
          } else {
            // Property 4: Otherwise, month should decrease by 1 and year should stay the same
            expect(newMonth).toBe(month - 1);
            expect(newYear).toBe(year);
          }
        }
      ),
      { numRuns: 100 } // Minimum 100 iterations as per design spec
    );
  });

  it('should navigate to the next month for any starting month', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2099 }),
        (month, year) => {
          const [newMonth, newYear] = navigateToNextMonth(month, year);

          // Property 1: New month should be valid (0-11)
          expect(newMonth).toBeGreaterThanOrEqual(0);
          expect(newMonth).toBeLessThanOrEqual(11);

          // Property 2: New year should be valid
          expect(newYear).toBeGreaterThanOrEqual(1900);
          expect(newYear).toBeLessThanOrEqual(2100);

          // Property 3: If original month was December (11), new month should be January (0)
          // and year should increase by 1
          if (month === 11) {
            expect(newMonth).toBe(0);
            expect(newYear).toBe(year + 1);
          } else {
            // Property 4: Otherwise, month should increase by 1 and year should stay the same
            expect(newMonth).toBe(month + 1);
            expect(newYear).toBe(year);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle year boundaries correctly when navigating backwards', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1901, max: 2100 }),
        (year) => {
          // Start at January (month 0)
          const month = 0;
          const [newMonth, newYear] = navigateToPreviousMonth(month, year);

          // Property: Navigating from January should go to December of previous year
          expect(newMonth).toBe(11);
          expect(newYear).toBe(year - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle year boundaries correctly when navigating forwards', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1900, max: 2099 }),
        (year) => {
          // Start at December (month 11)
          const month = 11;
          const [newMonth, newYear] = navigateToNextMonth(month, year);

          // Property: Navigating from December should go to January of next year
          expect(newMonth).toBe(0);
          expect(newYear).toBe(year + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain month continuity: navigating forward then backward returns to original', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1901, max: 2099 }),
        (month, year) => {
          // Navigate forward then backward
          const [nextMonth, nextYear] = navigateToNextMonth(month, year);
          const [backMonth, backYear] = navigateToPreviousMonth(nextMonth, nextYear);

          // Property: Should return to original month and year
          expect(backMonth).toBe(month);
          expect(backYear).toBe(year);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain month continuity: navigating backward then forward returns to original', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1901, max: 2099 }),
        (month, year) => {
          // Navigate backward then forward
          const [prevMonth, prevYear] = navigateToPreviousMonth(month, year);
          const [forwardMonth, forwardYear] = navigateToNextMonth(prevMonth, prevYear);

          // Property: Should return to original month and year
          expect(forwardMonth).toBe(month);
          expect(forwardYear).toBe(year);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should navigate through multiple months correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2095 }),
        fc.integer({ min: 1, max: 60 }), // Navigate 1-60 months forward
        (startMonth, startYear, monthsToNavigate) => {
          let currentMonth = startMonth;
          let currentYear = startYear;

          // Navigate forward N months
          for (let i = 0; i < monthsToNavigate; i++) {
            [currentMonth, currentYear] = navigateToNextMonth(currentMonth, currentYear);
          }

          // Property: Calculate expected final position
          const totalMonths = startYear * 12 + startMonth + monthsToNavigate;
          const expectedYear = Math.floor(totalMonths / 12);
          const expectedMonth = totalMonths % 12;

          expect(currentMonth).toBe(expectedMonth);
          expect(currentYear).toBe(expectedYear);
        }
      ),
      { numRuns: 100 }
    );
  });
});
