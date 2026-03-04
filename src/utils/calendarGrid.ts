import { getMonthDays, getFirstDayOfMonth } from './dateUtils';

/**
 * Represents a date cell in the calendar grid
 */
export interface CalendarDateCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

/**
 * Generate calendar grid for a given month and year
 * Returns an array of date cells including padding from adjacent months
 * The grid will have 35-42 cells (5-6 weeks) to display complete weeks
 * 
 * @param month - Month (0-11)
 * @param year - Full year (e.g., 2024)
 * @returns Array of calendar date cells
 */
export function generateCalendarGrid(month: number, year: number): CalendarDateCell[] {
  const cells: CalendarDateCell[] = [];
  
  // Get the first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getFirstDayOfMonth(month, year);
  
  // Get total days in current month
  const daysInMonth = getMonthDays(month, year);
  
  // Calculate previous month details
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getMonthDays(prevMonth, prevYear);
  
  // Add padding dates from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayOfMonth = daysInPrevMonth - i;
    cells.push({
      date: new Date(prevYear, prevMonth, dayOfMonth),
      dayOfMonth,
      isCurrentMonth: false,
    });
  }
  
  // Add dates from current month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      dayOfMonth: day,
      isCurrentMonth: true,
    });
  }
  
  // Add padding dates from next month to complete the grid
  // Grid should have complete weeks (multiples of 7)
  // Minimum 35 cells (5 weeks), maximum 42 cells (6 weeks)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  let day = 1;
  while (cells.length < 35 || cells.length % 7 !== 0) {
    cells.push({
      date: new Date(nextYear, nextMonth, day),
      dayOfMonth: day,
      isCurrentMonth: false,
    });
    day++;
  }
  
  return cells;
}
