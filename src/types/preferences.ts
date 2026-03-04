import type { Mood } from './entry';
import type { SortOrder } from './sort';

/**
 * User preferences stored in local storage.
 */
export interface UserPreferences {
  /** Preferred sort order for entry list */
  sortOrder: SortOrder;
  /** Theme preference */
  theme: 'light' | 'dark' | 'auto';
  /** Default mood for new entries */
  defaultMood: Mood | null;
  /** Schema version for future migrations */
  version: number;
}
