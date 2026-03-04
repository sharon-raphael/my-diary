import type { Entry } from '../types';

/**
 * Get the number of days in a given month
 * @param month - Month (0-11)
 * @param year - Full year (e.g., 2024)
 * @returns Number of days in the month
 */
export function getMonthDays(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week for the first day of a given month
 * @param month - Month (0-11)
 * @param year - Full year (e.g., 2024)
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Check if two dates represent the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format month and year for display
 * @param month - Month (0-11)
 * @param year - Full year (e.g., 2024)
 * @returns Formatted string (e.g., "January 2024")
 */
export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get a date key in YYYY-MM-DD format
 * @param date - Date to format
 * @returns Date key string
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Group entries by date (returns Record for calendar view)
 * @param entries - Array of entries
 * @returns Object mapping date keys to entry arrays
 */
export function groupEntriesByDate(entries: Entry[]): Record<string, Entry[]> {
  const grouped: Record<string, Entry[]> = {};
  
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const key = getDateKey(date);
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  }
  
  return grouped;
}

