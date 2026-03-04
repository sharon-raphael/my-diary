import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Entry } from '../types/entry';
import { storageService } from '../services/StorageService';

/**
 * Return type for the useEntries hook.
 */
export interface UseEntriesReturn {
  /** Array of all entries */
  entries: Entry[];
  /** Loading state indicator */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Creates a new entry */
  createEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'lastModifiedAt' | 'version'>) => Promise<Entry>;
  /** Updates an existing entry */
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<Entry>;
  /** Deletes an entry */
  deleteEntry: (id: string) => Promise<void>;
  /** Gets a single entry by ID */
  getEntry: (id: string) => Entry | undefined;
  /** Exports all entries as JSON */
  exportEntries: () => void;
  /** Imports entries from a file */
  importEntries: (file: File) => Promise<void>;
}

/**
 * Custom hook for managing journal entries with persistence.
 * Handles CRUD operations, loading state, and error handling.
 * 
 * @returns Object containing entries array and CRUD functions
 */
export function useEntries(): UseEntriesReturn {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load entries on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedEntries = await storageService.loadEntries();
        setEntries(loadedEntries);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to load entries');
        setError(errorObj);
        console.error('Error loading entries:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  /**
   * Creates a new entry with generated ID and timestamps.
   * 
   * @param entry - Entry data without id, timestamps, and version
   * @returns Promise resolving to the created entry
   */
  const createEntry = useCallback(async (
    entry: Omit<Entry, 'id' | 'createdAt' | 'lastModifiedAt' | 'version'>
  ): Promise<Entry> => {
    try {
      const now = Date.now();
      const newEntry: Entry = {
        id: uuidv4(),
        ...entry,
        createdAt: now,
        lastModifiedAt: now,
        version: 1
      };

      await storageService.saveEntry(newEntry);
      setEntries(prev => [...prev, newEntry]);
      setError(null);
      
      return newEntry;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create entry');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  /**
   * Updates an existing entry, preserving createdAt timestamp.
   * 
   * @param id - ID of the entry to update
   * @param updates - Partial entry data to update
   * @returns Promise resolving to the updated entry
   * @throws Error if entry not found
   */
  const updateEntry = useCallback(async (
    id: string,
    updates: Partial<Entry>
  ): Promise<Entry> => {
    try {
      const existingEntry = entries.find(e => e.id === id);
      
      if (!existingEntry) {
        throw new Error(`Entry with id ${id} not found`);
      }

      const updatedEntry: Entry = {
        ...existingEntry,
        ...updates,
        id: existingEntry.id, // Ensure ID cannot be changed
        createdAt: existingEntry.createdAt, // Preserve creation timestamp
        lastModifiedAt: Date.now() // Update modification timestamp
      };

      await storageService.saveEntry(updatedEntry);
      setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
      setError(null);
      
      return updatedEntry;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update entry');
      setError(errorObj);
      throw errorObj;
    }
  }, [entries]);

  /**
   * Deletes an entry by ID.
   * 
   * @param id - ID of the entry to delete
   * @returns Promise that resolves when deletion is complete
   */
  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    try {
      await storageService.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete entry');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  /**
   * Gets a single entry by ID.
   * 
   * @param id - ID of the entry to retrieve
   * @returns The entry if found, undefined otherwise
   */
  const getEntry = useCallback((id: string): Entry | undefined => {
    return entries.find(e => e.id === id);
  }, [entries]);

  /**
   * Exports all entries as a JSON file download.
   */
  const exportEntries = useCallback(() => {
    try {
      const jsonData = storageService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `journal-export-${date}.json`;
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to export entries');
      setError(errorObj);
      console.error('Error exporting entries:', err);
    }
  }, []);

  /**
   * Imports entries from a JSON file.
   * 
   * @param file - File object containing JSON data
   * @returns Promise that resolves when import is complete
   */
  const importEntries = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const importedEntries = await storageService.importData(text);
      
      // Reload all entries from storage to get the merged result
      const allEntries = await storageService.loadEntries();
      setEntries(allEntries);
      setError(null);
      
      console.log(`Successfully imported ${importedEntries.length} entries`);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to import entries');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    exportEntries,
    importEntries
  };
}
