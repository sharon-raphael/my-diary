/**
 * Format timestamp to human-readable date
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format timestamp to human-readable date and time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format timestamp to short date (e.g., "Jan 15, 2024")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted short date string
 */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get calendar date string (YYYY-MM-DD) for grouping
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Calendar date string
 */
export function getCalendarDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Group entries by calendar date
 * @param entries - Array of entries with createdAt timestamps
 * @returns Map of date strings to entry arrays
 */
export function groupEntriesByDate<T extends { createdAt: number }>(
  entries: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const entry of entries) {
    const dateKey = getCalendarDate(entry.createdAt);
    const group = groups.get(dateKey) || [];
    group.push(entry);
    groups.set(dateKey, group);
  }

  return groups;
}
