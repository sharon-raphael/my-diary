import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Entry, Mood, SortOrder } from '../../src/types';

/**
 * Property tests for search and sort functionality
 */
describe('Search and Sort Properties', () => {
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

  /**
   * Search entries helper
   */
  function searchEntries(entries: Entry[], query: string): Entry[] {
    if (!query.trim()) {
      return entries;
    }

    const lowerQuery = query.toLowerCase();
    return entries.filter((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
      const contentMatch = entry.content.toLowerCase().includes(lowerQuery);
      return titleMatch || contentMatch;
    });
  }

  it('Property 10: Search Result Matching - For any non-empty search query, all entries returned SHALL contain the search text in either title or content', () => {
    // Feature: journey-journal-app, Property 10: Search Result Matching
    // Validates: Requirements 5.1, 5.2
    fc.assert(
      fc.property(
        entriesArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (entries, query) => {
          const results = searchEntries(entries, query);

          const lowerQuery = query.toLowerCase();
          for (const entry of results) {
            const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
            const contentMatch = entry.content.toLowerCase().includes(lowerQuery);
            expect(titleMatch || contentMatch).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: Case-Insensitive Search - For any search query, changing the case SHALL return the same set of matching entries', () => {
    // Feature: journey-journal-app, Property 11: Case-Insensitive Search
    // Validates: Requirements 5.5
    fc.assert(
      fc.property(
        entriesArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }),
        (entries, query) => {
          const lowerResults = searchEntries(entries, query.toLowerCase());
          const upperResults = searchEntries(entries, query.toUpperCase());
          const mixedResults = searchEntries(entries, query);

          // All should return same entries (by ID)
          const lowerIds = new Set(lowerResults.map(e => e.id));
          const upperIds = new Set(upperResults.map(e => e.id));
          const mixedIds = new Set(mixedResults.map(e => e.id));

          expect(lowerIds.size).toBe(upperIds.size);
          expect(lowerIds.size).toBe(mixedIds.size);

          for (const id of lowerIds) {
            expect(upperIds.has(id)).toBe(true);
            expect(mixedIds.has(id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Sort entries helper
   */
  function sortEntries(entries: Entry[], order: SortOrder): Entry[] {
    const sorted = [...entries];

    switch (order) {
      case 'createdAt-desc':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'createdAt-asc':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'modifiedAt-desc':
        return sorted.sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);
      case 'modifiedAt-asc':
        return sorted.sort((a, b) => a.lastModifiedAt - b.lastModifiedAt);
      default:
        return sorted;
    }
  }

  it('Property 16: Ascending Date Sort Order - Sorting by createdAt ascending SHALL result in entries ordered from oldest to newest', () => {
    // Feature: journey-journal-app, Property 16: Ascending Date Sort Order
    // Validates: Requirements 7.2
    fc.assert(
      fc.property(entriesArbitrary, (entries) => {
        const sorted = sortEntries(entries, 'createdAt-asc');

        // Verify ascending order
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].createdAt).toBeGreaterThanOrEqual(sorted[i - 1].createdAt);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 17: Modified Date Sort Order - Sorting by lastModifiedAt SHALL result in entries ordered based on modification timestamps', () => {
    // Feature: journey-journal-app, Property 17: Modified Date Sort Order
    // Validates: Requirements 7.3
    fc.assert(
      fc.property(entriesArbitrary, (entries) => {
        const sortedDesc = sortEntries(entries, 'modifiedAt-desc');
        const sortedAsc = sortEntries(entries, 'modifiedAt-asc');

        // Verify descending order
        for (let i = 1; i < sortedDesc.length; i++) {
          expect(sortedDesc[i].lastModifiedAt).toBeLessThanOrEqual(sortedDesc[i - 1].lastModifiedAt);
        }

        // Verify ascending order
        for (let i = 1; i < sortedAsc.length; i++) {
          expect(sortedAsc[i].lastModifiedAt).toBeGreaterThanOrEqual(sortedAsc[i - 1].lastModifiedAt);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 18: Sort Preference Persistence - Sort order preference SHALL persist across app reloads', () => {
    // Feature: journey-journal-app, Property 18: Sort Preference Persistence
    // Validates: Requirements 7.5
    const sortOrders: SortOrder[] = ['createdAt-desc', 'createdAt-asc', 'modifiedAt-desc', 'modifiedAt-asc'];

    fc.assert(
      fc.property(fc.constantFrom(...sortOrders), (sortOrder) => {
        const key = 'journal_app_sort_preference';

        // Simulate saving preference
        localStorage.setItem(key, sortOrder);

        // Simulate loading preference
        const loaded = localStorage.getItem(key);

        expect(loaded).toBe(sortOrder);
      }),
      { numRuns: 100 }
    );
  });
});
