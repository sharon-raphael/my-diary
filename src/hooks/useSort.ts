import { useState, useMemo, useEffect } from 'react';
import type { Entry, SortOrder } from '../types';

const SORT_PREFERENCE_KEY = 'journal_app_sort_preference';

/**
 * Hook for sorting entries with preference persistence
 */
export function useSort(entries: Entry[]) {
  // Load sort preference from localStorage
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    try {
      const saved = localStorage.getItem(SORT_PREFERENCE_KEY);
      if (saved && isValidSortOrder(saved)) {
        return saved as SortOrder;
      }
    } catch (error) {
      console.error('Failed to load sort preference:', error);
    }
    return 'createdAt-desc'; // Default
  });

  // Save sort preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SORT_PREFERENCE_KEY, sortOrder);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  }, [sortOrder]);

  /**
   * Sort entries based on current sort order
   */
  const sortedEntries = useMemo(() => {
    const sorted = [...entries];

    switch (sortOrder) {
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
  }, [entries, sortOrder]);

  return {
    sortOrder,
    setSortOrder,
    sortedEntries
  };
}

/**
 * Type guard for SortOrder
 */
function isValidSortOrder(value: string): value is SortOrder {
  return ['createdAt-desc', 'createdAt-asc', 'modifiedAt-desc', 'modifiedAt-asc'].includes(value);
}
