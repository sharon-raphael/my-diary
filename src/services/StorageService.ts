import type { Entry } from '../types/entry';
import { getCalendarDate } from '../utils/dateFormatter';
import type { UserPreferences } from '../types/preferences';
import { STORAGE_KEYS } from '../types/storage';
import type { StorageContainer, StoredEntry } from '../types/storage';
import { StorageError } from '../types/errors';

/**
 * StorageAdapter wraps the Local Storage API with error handling.
 * Provides a consistent interface for data persistence operations.
 */
class StorageAdapter {
  /**
   * Retrieves an item from Local Storage.
   * @param key - The storage key
   * @returns The stored value or null if not found or on error
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  }

  /**
   * Stores an item in Local Storage.
   * @param key - The storage key
   * @param value - The value to store
   * @throws {StorageError} If quota is exceeded or write fails
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError(
          'Storage quota exceeded. Please delete some entries or export your data.',
          'QUOTA_EXCEEDED'
        );
      }
      throw new StorageError('Failed to write to storage', 'VALIDATION_ERROR');
    }
  }

  /**
   * Removes an item from Local Storage.
   * @param key - The storage key
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  /**
   * Clears all items from Local Storage.
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
}

/**
 * StorageService handles all local storage operations with serialization.
 * Provides methods for saving, loading, and managing journal entries and preferences.
 */
export class StorageService {
  private adapter: StorageAdapter;

  constructor() {
    this.adapter = new StorageAdapter();
  }

  /**
   * Saves a single entry to Local Storage.
   * @param entry - The entry to save
   * @throws {StorageError} If storage quota is exceeded or serialization fails
   */
  async saveEntry(entry: Entry): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);

      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      const container: StorageContainer = {
        entries: entries.map(this.serializeEntry),
        version: 1,
        lastUpdated: Date.now()
      };

      const serialized = JSON.stringify(container);
      this.adapter.setItem(STORAGE_KEYS.ENTRIES, serialized);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to save entry', 'VALIDATION_ERROR');
    }
  }

  /**
   * Loads all entries from Local Storage.
   * @returns Array of entries, or empty array if none exist or on error
   */
  async loadEntries(): Promise<Entry[]> {
    try {
      const data = this.adapter.getItem(STORAGE_KEYS.ENTRIES);

      if (!data) {
        return [];
      }

      const container: StorageContainer = JSON.parse(data);

      if (!container.entries || !Array.isArray(container.entries)) {
        console.warn('Invalid storage container format, returning empty array');
        return [];
      }

      // Filter out corrupted entries and deserialize valid ones
      const entries: Entry[] = [];
      for (const storedEntry of container.entries) {
        try {
          const entry = this.deserializeEntry(storedEntry);
          entries.push(entry);
        } catch (error) {
          console.error('Skipping corrupted entry:', storedEntry.id, error);
          // Continue loading other entries
        }
      }

      return entries;
    } catch (error) {
      if (error instanceof Error && error.name === 'SyntaxError') {
        console.error('Failed to parse stored entries (corrupted data):', error);
        throw new StorageError('Corrupted data in storage', 'CORRUPTED_DATA');
      }
      console.error('Failed to load entries:', error);
      return [];
    }
  }

  /**
   * Deletes an entry from Local Storage.
   * @param id - The ID of the entry to delete
   * @throws {StorageError} If deletion fails
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const filtered = entries.filter(e => e.id !== id);

      const container: StorageContainer = {
        entries: filtered.map(this.serializeEntry),
        version: 1,
        lastUpdated: Date.now()
      };

      const serialized = JSON.stringify(container);
      this.adapter.setItem(STORAGE_KEYS.ENTRIES, serialized);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to delete entry', 'VALIDATION_ERROR');
    }
  }

  /**
   * Saves user preferences to Local Storage.
   * @param preferences - The preferences to save
   * @throws {StorageError} If storage quota is exceeded or serialization fails
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const serialized = JSON.stringify(preferences);
      this.adapter.setItem(STORAGE_KEYS.PREFERENCES, serialized);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to save preferences', 'VALIDATION_ERROR');
    }
  }

  /**
   * Loads user preferences from Local Storage.
   * @returns User preferences, or default preferences if none exist
   */
  async loadPreferences(): Promise<UserPreferences> {
    try {
      const data = this.adapter.getItem(STORAGE_KEYS.PREFERENCES);

      if (!data) {
        return this.getDefaultPreferences();
      }

      const preferences: UserPreferences = JSON.parse(data);
      return preferences;
    } catch (error) {
      console.error('Failed to load preferences, using defaults:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Exports all entries as a JSON string.
   * @returns JSON string containing all entries
   */
  exportData(): string {
    const data = this.adapter.getItem(STORAGE_KEYS.ENTRIES);
    return data || JSON.stringify({ entries: [], version: 1, lastUpdated: Date.now() });
  }

  /**
   * Imports entries from a JSON string.
   * @param jsonString - JSON string containing entries to import
   * @returns Array of successfully imported entries
   * @throws {StorageError} If JSON is invalid or import fails
   */
  async importData(jsonString: string): Promise<Entry[]> {
    try {
      const container: StorageContainer = JSON.parse(jsonString);

      if (!container.entries || !Array.isArray(container.entries)) {
        throw new StorageError('Invalid import format', 'PARSE_ERROR');
      }

      const importedEntries: Entry[] = [];
      for (const storedEntry of container.entries) {
        try {
          const entry = this.deserializeEntry(storedEntry);
          importedEntries.push(entry);
        } catch (error) {
          console.warn('Skipping invalid entry during import:', error);
        }
      }

      // Merge with existing entries (deduplication by ID)
      const existingEntries = await this.loadEntries();
      const existingIds = new Set(existingEntries.map(e => e.id));

      const newEntries = importedEntries.filter(e => !existingIds.has(e.id));
      const allEntries = [...existingEntries, ...newEntries];

      // Save merged entries
      const newContainer: StorageContainer = {
        entries: allEntries.map(this.serializeEntry),
        version: 1,
        lastUpdated: Date.now()
      };

      const serialized = JSON.stringify(newContainer);
      this.adapter.setItem(STORAGE_KEYS.ENTRIES, serialized);

      return importedEntries;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'SyntaxError') {
        throw new StorageError('Invalid JSON format', 'PARSE_ERROR');
      }
      throw new StorageError('Failed to import data', 'VALIDATION_ERROR');
    }
  }

  /**
   * Clears all data from Local Storage.
   */
  async clearAll(): Promise<void> {
    this.adapter.clear();
  }

  /**
   * Serializes an Entry to StoredEntry format.
   * @param entry - The entry to serialize
   * @returns Serialized entry
   */
  private serializeEntry(entry: Entry): StoredEntry {
    return {
      id: entry.id,
      title: entry.title,
      date: entry.date,
      content: entry.content,
      createdAt: entry.createdAt,
      lastModifiedAt: entry.lastModifiedAt,
      mood: entry.mood,
      tags: entry.tags,
      version: entry.version
    };
  }

  /**
   * Deserializes a StoredEntry to Entry format.
   * @param storedEntry - The stored entry to deserialize
   * @returns Deserialized entry
   * @throws {Error} If entry data is invalid
   */
  private deserializeEntry(storedEntry: StoredEntry): Entry {
    // Basic validation
    if (!storedEntry.id || typeof storedEntry.id !== 'string') {
      throw new Error('Invalid entry: missing or invalid id');
    }
    if (typeof storedEntry.title !== 'string') {
      throw new Error('Invalid entry: missing or invalid title');
    }
    if (typeof storedEntry.content !== 'string') {
      throw new Error('Invalid entry: missing or invalid content');
    }
    if (typeof storedEntry.createdAt !== 'number') {
      throw new Error('Invalid entry: missing or invalid createdAt');
    }
    if (typeof storedEntry.lastModifiedAt !== 'number') {
      throw new Error('Invalid entry: missing or invalid lastModifiedAt');
    }
    if (!Array.isArray(storedEntry.tags)) {
      throw new Error('Invalid entry: tags must be an array');
    }

    return {
      id: storedEntry.id,
      title: storedEntry.title,
      date: storedEntry.date || getCalendarDate(storedEntry.createdAt),
      content: storedEntry.content,
      createdAt: storedEntry.createdAt,
      lastModifiedAt: storedEntry.lastModifiedAt,
      mood: storedEntry.mood,
      tags: storedEntry.tags,
      version: storedEntry.version || 1
    };
  }

  /**
   * Returns default user preferences.
   * @returns Default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      sortOrder: 'createdAt-desc',
      theme: 'auto',
      defaultMood: null,
      version: 1
    };
  }
}

// Export a singleton instance
export const storageService = new StorageService();
