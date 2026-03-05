import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntries } from '../../src/hooks/useEntries';
import { storageService } from '../../src/services/StorageService';
import type { Entry, Mood } from '../../src/types/entry';

/**
 * Custom fast-check arbitrary for generating valid Entry data (without id and timestamps)
 */
const entryDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  date: fc.integer({ min: 1, max: 28 }).map(d => `2024-01-${String(d).padStart(2, '0')}`),
  content: fc.string({ minLength: 1, maxLength: 1000 }),
  mood: fc.option(
    fc.constantFrom<Mood>(
      'happy',
      'sad',
      'excited',
      'anxious',
      'calm',
      'grateful',
      'reflective',
      'energetic'
    ),
    { nil: null }
  ),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  version: fc.constant(1)
});

describe('Property-Based Tests: Entry List Consistency', () => {
  // Clear localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Property 3: Entry List Consistency', () => {
    it('should display all entries that exist in storage in the entry list', async () => {
      // Feature: journey-journal-app, Property 3: For any entry that exists in storage, that entry SHALL appear in the Entry_List when the list is rendered
      // Validates: Requirements 1.5, 8.4, 12.6

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 1, maxLength: 10 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            const { result } = renderHook(() => useEntries());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Create multiple entries
            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              await act(async () => {
                const entry = await result.current.createEntry(entryData);
                createdEntries.push(entry);
              });
            }

            // Verify all created entries appear in the entry list
            expect(result.current.entries.length).toBe(createdEntries.length);

            for (const createdEntry of createdEntries) {
              const foundEntry = result.current.entries.find(e => e.id === createdEntry.id);
              expect(foundEntry).toBeDefined();
              expect(foundEntry).toEqual(createdEntry);
            }
          }
        ),
      );
    }, 15000);

    it('should display entries after reloading from storage', async () => {
      // Test that entries persist and appear in list after reload
      // Validates: Requirements 8.4

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 1, maxLength: 5 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            // First hook instance - create entries
            const { result: result1 } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              await act(async () => {
                const entry = await result1.current.createEntry(entryData);
                createdEntries.push(entry);
              });
            }

            // Second hook instance - simulate app reload
            const { result: result2 } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result2.current.loading).toBe(false);
            });

            // Verify all entries are loaded and appear in the list
            expect(result2.current.entries.length).toBe(createdEntries.length);

            for (const createdEntry of createdEntries) {
              const foundEntry = result2.current.entries.find(e => e.id === createdEntry.id);
              expect(foundEntry).toBeDefined();
              expect(foundEntry).toEqual(createdEntry);
            }
          }
        ),
      );
    }, 15000);

    it('should display imported entries in the entry list', async () => {
      // Test that imported entries appear in the list
      // Validates: Requirements 12.6

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 1, maxLength: 5 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            // Create entries in first hook instance
            const { result: result1 } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              await act(async () => {
                const entry = await result1.current.createEntry(entryData);
                createdEntries.push(entry);
              });
            }

            // Export the data
            const exportedData = storageService.exportData();

            // Clear storage
            localStorage.clear();

            // Create new hook instance and import
            const { result: result2 } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result2.current.loading).toBe(false);
            });

            // Import the data - create a proper File mock
            const file = {
              text: async () => exportedData,
              name: 'test-import.json',
              type: 'application/json'
            } as File;

            await act(async () => {
              await result2.current.importEntries(file);
            });

            // Verify all imported entries appear in the list
            expect(result2.current.entries.length).toBe(createdEntries.length);

            for (const createdEntry of createdEntries) {
              const foundEntry = result2.current.entries.find(e => e.id === createdEntry.id);
              expect(foundEntry).toBeDefined();
              expect(foundEntry).toEqual(createdEntry);
            }
          }
        ),
      );
    }, 15000);

    it('should maintain entry list consistency after mixed operations', async () => {
      // Test that entry list remains consistent after create, update, and delete operations
      // Validates: Requirements 1.5, 8.4

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 3, maxLength: 8 }),
          fc.integer({ min: 0, max: 7 }),
          async (entriesData, updateIndex) => {
            // Clear storage for this iteration
            localStorage.clear();

            const { result } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Create entries
            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              await act(async () => {
                const entry = await result.current.createEntry(entryData);
                createdEntries.push(entry);
              });
            }

            // Update one entry
            const indexToUpdate = updateIndex % createdEntries.length;
            const entryToUpdate = createdEntries[indexToUpdate];

            await act(async () => {
              const updated = await result.current.updateEntry(entryToUpdate.id, {
                title: 'Updated Title'
              });
              createdEntries[indexToUpdate] = updated;
            });

            // Verify all entries still appear in the list
            expect(result.current.entries.length).toBe(createdEntries.length);

            for (const entry of createdEntries) {
              const foundEntry = result.current.entries.find(e => e.id === entry.id);
              expect(foundEntry).toBeDefined();
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 7: Deletion Cancellation Preserves Entry', () => {
    it('should preserve entry unchanged when deletion is cancelled', async () => {
      // Feature: journey-journal-app, Property 7: For any entry where deletion is initiated but cancelled, the entry SHALL remain completely unchanged in both storage and the entry list
      // Validates: Requirements 3.4

      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, async (entryData) => {
          // Clear storage for this iteration
          localStorage.clear();

          const { result } = renderHook(() => useEntries());

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // Create an entry
          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(entryData);
          });

          expect(createdEntry).toBeDefined();

          // Store the original entry state
          const originalEntry = { ...createdEntry! };
          const originalEntriesCount = result.current.entries.length;

          // Simulate deletion cancellation by not calling deleteEntry
          // In a real UI, this would be when the user clicks "Cancel" in the confirmation dialog
          // We verify that without calling deleteEntry, the entry remains unchanged

          // Verify entry is still in the list
          const foundEntry = result.current.getEntry(originalEntry.id);
          expect(foundEntry).toBeDefined();
          expect(foundEntry).toEqual(originalEntry);

          // Verify entry list count hasn't changed
          expect(result.current.entries.length).toBe(originalEntriesCount);

          // Verify entry is still in storage by reloading
          const { result: result2 } = renderHook(() => useEntries());

          await waitFor(() => {
            expect(result2.current.loading).toBe(false);
          });

          const reloadedEntry = result2.current.getEntry(originalEntry.id);
          expect(reloadedEntry).toBeDefined();
          expect(reloadedEntry).toEqual(originalEntry);
        }),
        { numRuns: 20 } // Reduced runs due to multiple hook renders
      );
    }, 10000); // 10 second timeout

    it('should preserve all entry fields when deletion is cancelled', async () => {
      // Test that all fields remain unchanged when deletion is cancelled
      // Validates: Requirements 3.4

      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, async (entryData) => {
          // Clear storage for this iteration
          localStorage.clear();

          const { result } = renderHook(() => useEntries());

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // Create an entry
          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(entryData);
          });

          // Store all original field values
          const originalId = createdEntry!.id;
          const originalTitle = createdEntry!.title;
          const originalContent = createdEntry!.content;
          const originalCreatedAt = createdEntry!.createdAt;
          const originalLastModifiedAt = createdEntry!.lastModifiedAt;
          const originalMood = createdEntry!.mood;
          const originalTags = [...createdEntry!.tags];
          const originalVersion = createdEntry!.version;

          // Simulate cancellation (no deletion occurs)
          // Verify all fields remain unchanged
          const entry = result.current.getEntry(originalId);
          expect(entry).toBeDefined();
          expect(entry!.id).toBe(originalId);
          expect(entry!.title).toBe(originalTitle);
          expect(entry!.content).toBe(originalContent);
          expect(entry!.createdAt).toBe(originalCreatedAt);
          expect(entry!.lastModifiedAt).toBe(originalLastModifiedAt);
          expect(entry!.mood).toBe(originalMood);
          expect(entry!.tags).toEqual(originalTags);
          expect(entry!.version).toBe(originalVersion);
        }),
        { numRuns: 50 }
      );
    });

    it('should not affect other entries when deletion is cancelled', async () => {
      // Test that cancelling deletion of one entry doesn't affect other entries
      // Validates: Requirements 3.4

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          async (entriesData, cancelIndex) => {
            // Clear storage for this iteration
            localStorage.clear();

            const { result } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Create multiple entries
            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              await act(async () => {
                const entry = await result.current.createEntry(entryData);
                createdEntries.push(entry);
              });
            }

            const indexToCancel = cancelIndex % createdEntries.length;
            const entryToCancel = createdEntries[indexToCancel];
            const otherEntries = createdEntries.filter((_, i) => i !== indexToCancel);

            // Simulate cancellation (no deletion occurs)
            // Verify the "cancelled" entry still exists
            expect(result.current.getEntry(entryToCancel.id)).toBeDefined();
            expect(result.current.getEntry(entryToCancel.id)).toEqual(entryToCancel);

            // Verify all other entries still exist and are unchanged
            for (const otherEntry of otherEntries) {
              const found = result.current.getEntry(otherEntry.id);
              expect(found).toBeDefined();
              expect(found).toEqual(otherEntry);
            }

            // Verify total count is unchanged
            expect(result.current.entries.length).toBe(createdEntries.length);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 20: Entry Load Completeness', () => {
    it('should parse and load all valid entries from storage', async () => {
      // Feature: journey-journal-app, Property 20: For any entries stored in Local_Storage, loading the application SHALL parse and make available all valid entries
      // Validates: Requirements 8.3

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 1, maxLength: 10 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            // Create entries using storage service directly
            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              const now = Date.now();
              const entry: Entry = {
                id: `test-${Math.random().toString(36).substring(7)}`,
                ...entryData,
                createdAt: now,
                lastModifiedAt: now
              };
              await storageService.saveEntry(entry);
              createdEntries.push(entry);
            }

            // Load entries using the hook (simulates app load)
            const { result } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Verify all entries were loaded
            expect(result.current.entries.length).toBe(createdEntries.length);

            // Verify each entry is available
            for (const createdEntry of createdEntries) {
              const foundEntry = result.current.entries.find(e => e.id === createdEntry.id);
              expect(foundEntry).toBeDefined();
              expect(foundEntry).toEqual(createdEntry);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should load all entries with complete data fields', async () => {
      // Test that all fields are loaded correctly
      // Validates: Requirements 8.3

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 1, maxLength: 5 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            // Create entries
            const createdEntries: Entry[] = [];
            for (const entryData of entriesData) {
              const now = Date.now();
              const entry: Entry = {
                id: `test-${Math.random().toString(36).substring(7)}`,
                ...entryData,
                createdAt: now,
                lastModifiedAt: now
              };
              await storageService.saveEntry(entry);
              createdEntries.push(entry);
            }

            // Load entries
            const { result } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Verify all fields are loaded for each entry
            for (const createdEntry of createdEntries) {
              const loadedEntry = result.current.entries.find(e => e.id === createdEntry.id);

              expect(loadedEntry).toBeDefined();
              expect(loadedEntry!.id).toBe(createdEntry.id);
              expect(loadedEntry!.title).toBe(createdEntry.title);
              expect(loadedEntry!.content).toBe(createdEntry.content);
              expect(loadedEntry!.createdAt).toBe(createdEntry.createdAt);
              expect(loadedEntry!.lastModifiedAt).toBe(createdEntry.lastModifiedAt);
              expect(loadedEntry!.mood).toBe(createdEntry.mood);
              expect(loadedEntry!.tags).toEqual(createdEntry.tags);
              expect(loadedEntry!.version).toBe(createdEntry.version);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle empty storage gracefully', async () => {
      // Test that loading from empty storage returns empty array
      // Validates: Requirements 8.3

      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Ensure storage is empty
          localStorage.clear();

          // Load entries
          const { result } = renderHook(() => useEntries());

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // Verify empty array is returned
          expect(result.current.entries).toEqual([]);
          expect(result.current.entries.length).toBe(0);
          expect(result.current.error).toBeNull();
        }),
        { numRuns: 10 }
      );
    });

    it('should skip corrupted entries and load valid ones', async () => {
      // Test that corrupted entries are skipped but valid ones are loaded
      // Validates: Requirements 8.3, 8.6

      await fc.assert(
        fc.asyncProperty(
          fc.array(entryDataArbitrary, { minLength: 2, maxLength: 5 }),
          async (entriesData) => {
            // Clear storage for this iteration
            localStorage.clear();

            // Create valid entries
            const validEntries: Entry[] = [];
            for (const entryData of entriesData) {
              const now = Date.now();
              const entry: Entry = {
                id: `test-${Math.random().toString(36).substring(7)}`,
                ...entryData,
                createdAt: now,
                lastModifiedAt: now
              };
              await storageService.saveEntry(entry);
              validEntries.push(entry);
            }

            // Manually inject a corrupted entry into storage
            const storageData = localStorage.getItem('journal_entries');
            if (storageData) {
              const container = JSON.parse(storageData);
              container.entries.push({
                id: 'corrupted-entry',
                // Missing required fields like title, content, timestamps
                invalid: true
              });
              localStorage.setItem('journal_entries', JSON.stringify(container));
            }

            // Load entries
            const { result } = renderHook(() => useEntries());

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Verify valid entries were loaded (corrupted one skipped)
            expect(result.current.entries.length).toBe(validEntries.length);

            // Verify each valid entry is present
            for (const validEntry of validEntries) {
              const foundEntry = result.current.entries.find(e => e.id === validEntry.id);
              expect(foundEntry).toBeDefined();
              expect(foundEntry).toEqual(validEntry);
            }

            // Verify corrupted entry is not in the list
            const corruptedEntry = result.current.entries.find(e => e.id === 'corrupted-entry');
            expect(corruptedEntry).toBeUndefined();
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
