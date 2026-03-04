import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Entry, Mood } from '../../src/types';
import { getCalendarDate, groupEntriesByDate, formatDate } from '../../src/utils/dateFormatter';

/**
 * Property tests for date formatting and grouping
 */
describe('Date Grouping and Formatting Properties', () => {
  const moodArbitrary = fc.constantFrom<Mood>(
    'happy', 'sad', 'excited', 'anxious', 'calm', 'grateful', 'reflective', 'energetic'
  );

  const entryArbitrary = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    content: fc.string({ minLength: 1, maxLength: 1000 }),
    createdAt: fc.integer({ min: 1000000000000, max: Date.now() }),
    lastModifiedAt: fc.integer({ min: 1000000000000, max: Date.now() }),
    mood: fc.option(moodArbitrary, { nil: null }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
    version: fc.constant(1)
  });

  const entriesArbitrary = fc.array(entryArbitrary, { minLength: 1, maxLength: 20 });

  it('Property 21: Date Format Display - Entry_List SHALL display creation date in human-readable format (not raw timestamp)', () => {
    // Feature: journey-journal-app, Property 21: Date Format Display
    // Validates: Requirements 9.2
    fc.assert(
      fc.property(entryArbitrary, (entry) => {
        const formatted = formatDate(entry.createdAt);

        // Verify it's not a raw timestamp
        expect(formatted).not.toBe(entry.createdAt.toString());

        // Verify it's a string
        expect(typeof formatted).toBe('string');

        // Verify it contains date-like content (month name or numbers)
        const hasDateContent = /\d{1,2}/.test(formatted) || /[A-Za-z]{3,}/.test(formatted);
        expect(hasDateContent).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 23: Date Grouping - Entries with the same calendar date SHALL be grouped together', () => {
    // Feature: journey-journal-app, Property 23: Date Grouping
    // Validates: Requirements 9.5
    fc.assert(
      fc.property(entriesArbitrary, (entries) => {
        const grouped = groupEntriesByDate(entries);

        // Verify all entries are in groups
        let totalInGroups = 0;
        for (const group of grouped.values()) {
          totalInGroups += group.length;
        }
        expect(totalInGroups).toBe(entries.length);

        // Verify entries in same group have same calendar date
        for (const [dateKey, group] of grouped.entries()) {
          for (const entry of group) {
            const entryDate = getCalendarDate(entry.createdAt);
            expect(entryDate).toBe(dateKey);
          }
        }

        // Verify no entry appears in multiple groups
        const allGroupedIds = new Set<string>();
        for (const group of grouped.values()) {
          for (const entry of group) {
            expect(allGroupedIds.has(entry.id)).toBe(false);
            allGroupedIds.add(entry.id);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
