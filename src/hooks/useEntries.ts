import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import type { Entry } from '../types/entry';
import { storageService } from '../services/StorageService';
import { mediaService } from '../services/MediaService';

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
  /** Deletes all entries */
  deleteAllEntries: () => Promise<void>;
  /** Gets a single entry by ID */
  getEntry: (id: string) => Entry | undefined;
  /** Exports all entries as JSON or ZIP */
  exportEntries: () => Promise<void>;
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
   * Deletes all entries from storage.
   */
  const deleteAllEntries = useCallback(async (): Promise<void> => {
    try {
      if (entries.some(e => e.media && e.media.length > 0)) {
        for (const entry of entries) {
          if (entry.media) {
            for (const m of entry.media) {
              await mediaService.deleteMedia(m.id);
            }
          }
        }
      }
      await storageService.clearAll();
      setEntries([]);
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete all entries');
      setError(errorObj);
      throw errorObj;
    }
  }, [entries]);

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
   * Exports all entries as a ZIP archive if media exists, or JSON.
   */
  const exportEntries = useCallback(async (): Promise<void> => {
    try {
      const zip = new JSZip();
      const jsonData = storageService.exportData();
      zip.file('journal-data.json', jsonData);

      const container = JSON.parse(jsonData);
      const entriesToExport = container.entries || [];
      const mediaFolder = zip.folder('media');

      if (mediaFolder) {
        for (const entry of entriesToExport) {
          if (entry.media && entry.media.length > 0) {
            for (const media of entry.media) {
              const blob = await mediaService.loadMedia(media.id);
              if (blob) {
                mediaFolder.file(media.id, blob);
              }
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      const date = new Date().toISOString().split('T')[0];
      const filename = `journal-export-${date}.zip`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

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
   * Imports entries from a ZIP archive or JSON file.
   */
  const importEntries = useCallback(async (file: File): Promise<void> => {
    try {
      let importedEntries = [];

      if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        const jsonFile = zip.file('journal-data.json');

        if (!jsonFile) {
          throw new Error('Invalid backup file: missing journal-data.json');
        }

        const jsonData = await jsonFile.async('string');
        importedEntries = await storageService.importData(jsonData);

        const mediaFolder = zip.folder('media');
        if (mediaFolder) {
          const files = Object.keys(mediaFolder.files);
          for (const filename of files) {
            if (!mediaFolder.files[filename].dir) {
              const fileData = await mediaFolder.files[filename].async('blob');
              const id = filename.split('/').pop();
              if (id) {
                await mediaService.saveMedia(id, fileData);
              }
            }
          }
        }
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        importedEntries = await storageService.importData(text);
      } else {
        throw new Error('Unsupported file format. Please upload a .zip or .json file.');
      }

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
    deleteAllEntries,
    getEntry,
    exportEntries,
    importEntries
  };
}
