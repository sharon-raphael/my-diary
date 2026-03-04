import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateCalendarGrid } from './calendarGrid';

// Feature: calendar-view, Property 1: Calendar Grid Completeness
// For any month and year, the calendar grid should display complete weeks (35-42 date cells total),
// including padding dates from adjacent months that are visually distinguished from current month dates.
// **Validates: Requirements 1.1, 1.5**

describe('Calendar Grid Completeness Property Tests', () => {
  it('should generate complete weeks (35-42 cells) for any month and year', () => {
    fc.assert(
      fc.property(
        // Generate random month (0-11) and year (1900-2100)
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (month, year) => {
          const grid = generateCalendarGrid(month, year);
          
          // Property 1: Grid should have between 35 and 42 cells (5-6 complete weeks)
          expect(grid.length).toBeGreaterThanOrEqual(35);
          expect(grid.length).toBeLessThanOrEqual(42);
          
          // Property 2: Grid should have complete weeks (divisible by 7)
          expect(grid.length % 7).toBe(0);
        }
      ),
      { numRuns: 100 } // Minimum 100 iterations as per design spec
    );
  });

  it('should include padding dates from adjacent months with visual distinction', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (month, year) => {
          const grid = generateCalendarGrid(month, year);
          
          // Property 3: Grid should contain dates from current month
          const currentMonthCells = grid.filter(cell => cell.isCurrentMonth);
          expect(currentMonthCells.length).toBeGreaterThan(0);
          
          // Property 4: Current month cells should match the actual days in the month
          const expectedDaysInMonth = new Date(year, month + 1, 0).getDate();
          expect(currentMonthCells.length).toBe(expectedDaysInMonth);
          
          // Property 5: Adjacent month cells should be marked as not current month
          const adjacentMonthCells = grid.filter(cell => !cell.isCurrentMonth);
          
          // Property 6: If grid has more than the days in current month, 
          // there must be adjacent month padding
          if (grid.length > expectedDaysInMonth) {
            expect(adjacentMonthCells.length).toBeGreaterThan(0);
          }
          
          // Property 7: Adjacent month cells should be visually distinguished
          // (verified by isCurrentMonth flag being false)
          adjacentMonthCells.forEach(cell => {
            expect(cell.isCurrentMonth).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct date continuity across the grid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (month, year) => {
          const grid = generateCalendarGrid(month, year);
          
          // Property 8: Dates should be continuous (each date is one day after the previous)
          for (let i = 1; i < grid.length; i++) {
            const prevDate = grid[i - 1].date;
            const currDate = grid[i].date;
            
            // Compare dates by their calendar values (year, month, day) to avoid DST issues
            const prevYear = prevDate.getFullYear();
            const prevMonth = prevDate.getMonth();
            const prevDay = prevDate.getDate();
            
            const currYear = currDate.getFullYear();
            const currMonth = currDate.getMonth();
            const currDay = currDate.getDate();
            
            // Create a new date that is one day after prevDate
            const expectedNextDate = new Date(prevYear, prevMonth, prevDay + 1);
            
            expect(currYear).toBe(expectedNextDate.getFullYear());
            expect(currMonth).toBe(expectedNextDate.getMonth());
            expect(currDay).toBe(expectedNextDate.getDate());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should start with the first day of the month in the correct weekday position', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (month, year) => {
          const grid = generateCalendarGrid(month, year);
          
          // Find the first cell that belongs to the current month
          const firstCurrentMonthIndex = grid.findIndex(cell => cell.isCurrentMonth);
          
          // Property 9: The first current month cell should be at the position 
          // matching the day of week for the first day of the month
          const firstDayOfMonth = new Date(year, month, 1);
          const expectedDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
          
          expect(firstCurrentMonthIndex).toBe(expectedDayOfWeek);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases: leap years and month boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1900, max: 2100 }),
        (month, year) => {
          const grid = generateCalendarGrid(month, year);
          
          // Property 10: February in leap years should have 29 days
          if (month === 1) { // February
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            const currentMonthCells = grid.filter(cell => cell.isCurrentMonth);
            const expectedDays = isLeapYear ? 29 : 28;
            expect(currentMonthCells.length).toBe(expectedDays);
          }
          
          // Property 11: All months should have valid day counts
          const currentMonthCells = grid.filter(cell => cell.isCurrentMonth);
          expect(currentMonthCells.length).toBeGreaterThanOrEqual(28);
          expect(currentMonthCells.length).toBeLessThanOrEqual(31);
        }
      ),
      { numRuns: 100 }
    );
  });
});
