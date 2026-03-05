import type { Mood } from './entry';

/**
 * Local Storage keys used by the application.
 */
export const STORAGE_KEYS = {
  ENTRIES: 'journal_entries',
  PREFERENCES: 'journal_preferences',
  VERSION: 'journal_schema_version'
} as const;

/**
 * Stored entry format (serialized).
 */
export interface StoredEntry {
  /** Unique identifier */
  id: string;
  /** Entry title */
  title: string;
  /** The calendar date of the entry (YYYY-MM-DD) */
  date: string;
  /** Serialized rich text content */
  content: string;
  /** Unix timestamp in milliseconds when entry was created */
  createdAt: number;
  /** Unix timestamp in milliseconds when entry was last modified */
  lastModifiedAt: number;
  /** Optional mood */
  mood: Mood | null;
  /** Array of tags */
  tags: string[];
  /** Schema version */
  version: number;
}

/**
 * Storage container for all entries.
 */
export interface StorageContainer {
  /** Array of stored entries */
  entries: StoredEntry[];
  /** Schema version */
  version: number;
  /** Unix timestamp of last update */
  lastUpdated: number;
}
