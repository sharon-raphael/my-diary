import { useState, useMemo } from 'react';
import type { Entry } from '../types';

/**
 * Hook for searching and filtering entries
 */
export function useSearch(entries: Entry[]) {
  const [query, setQuery] = useState('');

  /**
   * Filter entries based on search query
   * Searches across title and content fields (case-insensitive)
   */
  const filteredEntries = useMemo(() => {
    if (!query.trim()) {
      return entries;
    }

    const lowerQuery = query.toLowerCase();

    return entries.filter((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
      const contentMatch = entry.content.toLowerCase().includes(lowerQuery);
      return titleMatch || contentMatch;
    });
  }, [entries, query]);

  return {
    query,
    setQuery,
    filteredEntries
  };
}
