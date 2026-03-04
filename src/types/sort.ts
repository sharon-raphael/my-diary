/**
 * Available sorting options for entry list.
 */
export type SortOrder =
  | 'createdAt-desc'   // Newest first (default)
  | 'createdAt-asc'    // Oldest first
  | 'modifiedAt-desc'  // Recently modified first
  | 'modifiedAt-asc';  // Least recently modified first
