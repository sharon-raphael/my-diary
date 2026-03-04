/**
 * Represents a single journal entry.
 */
export interface Entry {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Entry title (max 200 characters) */
  title: string;
  /** Rich text content as HTML or JSON (max 100,000 characters) */
  content: string;
  /** Unix timestamp in milliseconds when entry was created */
  createdAt: number;
  /** Unix timestamp in milliseconds when entry was last modified */
  lastModifiedAt: number;
  /** Optional mood associated with the entry */
  mood: Mood | null;
  /** Array of tags for categorization */
  tags: string[];
  /** Schema version for future migrations */
  version: number;
}

/**
 * Predefined mood options for entries.
 */
export type Mood =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'anxious'
  | 'calm'
  | 'grateful'
  | 'reflective'
  | 'energetic';

/**
 * Mood option with display properties.
 */
export interface MoodOption {
  /** Mood value */
  value: Mood;
  /** Display label */
  label: string;
  /** Emoji representation */
  emoji: string;
  /** Color for visual indicator */
  color: string;
}
