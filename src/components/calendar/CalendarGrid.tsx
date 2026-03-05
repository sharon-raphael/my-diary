import type { Entry } from '../../types';
import { generateCalendarGrid } from '../../utils/calendarGrid';
import { getDateKey, isSameDay } from '../../utils/dateUtils';
import { WeekdayHeaders } from './WeekdayHeaders';
import { DateCell } from './DateCell';

/**
 * Props for CalendarGrid component
 */
export interface CalendarGridProps {
  month: number;
  year: number;
  entries: Entry[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

/**
 * Renders the calendar grid with date cells
 * Uses generateCalendarGrid utility to create the grid structure
 */
export function CalendarGrid({
  month,
  year,
  entries,
  currentDate,
  onDateClick,
}: CalendarGridProps) {
  // Generate the calendar grid with padding from adjacent months
  const gridCells = generateCalendarGrid(month, year);

  // Map entries to dates for quick lookup
  const entriesByDate: Record<string, number> = {};
  entries.forEach((entry) => {
    const key = entry.date;
    entriesByDate[key] = (entriesByDate[key] || 0) + 1;
  });

  return (
    <div className="calendar-grid">
      <WeekdayHeaders />
      <div className="calendar-dates">
        {gridCells.map((cell, index) => {
          const dateKey = getDateKey(cell.date);
          const entryCount = entriesByDate[dateKey] || 0;
          const isToday = isSameDay(cell.date, currentDate);

          return (
            <DateCell
              key={index}
              date={cell.date}
              isCurrentMonth={cell.isCurrentMonth}
              isToday={isToday}
              entryCount={entryCount}
              onClick={onDateClick}
            />
          );
        })}
      </div>
    </div>
  );
}
