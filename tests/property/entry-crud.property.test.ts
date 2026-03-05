import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntries } from '../../src/hooks/useEntries';
import type { Entry } from '../../src/types';
import { AppProvider } from '../../src/contexts/AppContext';
import React, { ReactNode } from 'react';

// Wrap hook renders with context provider
const wrapper = ({ children }: { children: ReactNode }) => React.createElement(AppProvider, null, children);

const entryDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  date: fc.integer({ min: 1, max: 28 }).map(d => `2024-01-${String(d).padStart(2, '0')}`),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  mood: fc.option(fc.constantFrom('happy', 'sad', 'calm'), { nil: null }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
});

describe('Entry CRUD Properties', () => {
  describe('Property 1: Creation Timestamps', () => {
    it('should create entries with timestamps within 1 second of current time', async () => {
      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, async (entryData) => {
          const { result } = renderHook(() => useEntries(), { wrapper });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          const beforeCreate = Date.now();
          let createdEntry: Entry | undefined;

          await act(async () => {
            createdEntry = await result.current.createEntry(entryData);
          });

          const afterCreate = Date.now();

          expect(createdEntry).toBeDefined();
          expect(createdEntry!.createdAt).toBeGreaterThanOrEqual(beforeCreate);
          expect(createdEntry!.createdAt).toBeLessThanOrEqual(afterCreate);
        }),
        { numRuns: 30 }
      );
    }, 15000);

    it('should set createdAt and lastModifiedAt to the same value on creation', async () => {
      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, async (entryData) => {
          const { result } = renderHook(() => useEntries(), { wrapper });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(entryData);
          });

          expect(createdEntry).toBeDefined();
          expect(createdEntry!.createdAt).toBe(createdEntry!.lastModifiedAt);
        }),
        { numRuns: 30 }
      );
    }, 15000);
  });

  describe('Property 2: Update Timestamps', () => {
    it('should preserve createdAt on update', async () => {
      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, entryDataArbitrary, async (initialData, updateData) => {
          const { result } = renderHook(() => useEntries(), { wrapper });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(initialData);
          });

          // Wait a tiny bit to ensure timestamp difference
          await new Promise(resolve => setTimeout(resolve, 10));

          let updatedEntry: Entry | undefined;
          await act(async () => {
            updatedEntry = await result.current.updateEntry(createdEntry!.id, updateData);
          });

          expect(updatedEntry).toBeDefined();
          expect(updatedEntry!.createdAt).toBe(createdEntry!.createdAt);
        }),
        { numRuns: 30 }
      );
    }, 15000);

    it('should update lastModifiedAt to be greater than createdAt on edit', async () => {
      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, entryDataArbitrary, async (initialData, updateData) => {
          const { result } = renderHook(() => useEntries(), { wrapper });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(initialData);
          });

          // Force a small delay
          await new Promise(resolve => setTimeout(resolve, 5));

          let updatedEntry: Entry | undefined;
          await act(async () => {
            updatedEntry = await result.current.updateEntry(createdEntry!.id, updateData);
          });

          expect(updatedEntry).toBeDefined();
          expect(updatedEntry!.lastModifiedAt).toBeGreaterThan(createdEntry!.createdAt);
        }),
        { numRuns: 30 }
      );
    }, 15000);
  });

  describe('Property 3: Deletion', () => {
    it('should remove the entry from the list when deleted', async () => {
      await fc.assert(
        fc.asyncProperty(entryDataArbitrary, async (entryData) => {
          const { result } = renderHook(() => useEntries(), { wrapper });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          let createdEntry: Entry | undefined;
          await act(async () => {
            createdEntry = await result.current.createEntry(entryData);
          });

          await act(async () => {
            await result.current.deleteEntry(createdEntry!.id);
          });

          expect(result.current.entries.find(e => e.id === createdEntry!.id)).toBeUndefined();
        }),
        { numRuns: 30 }
      );
    }, 15000);
  });
});
