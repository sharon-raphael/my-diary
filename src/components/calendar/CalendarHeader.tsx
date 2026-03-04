import { formatMonthYear } from '../../utils/dateUtils';

/**
 * Props for CalendarHeader component
 */
export interface CalendarHeaderProps {
  month: number;
  year: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

/**
 * Displays month/year and navigation controls
 */
export function CalendarHeader({
  month,
  year,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}: CalendarHeaderProps) {
  const monthYearDisplay = formatMonthYear(month, year);

  return (
    <div className="calendar-header">
      <h1>{monthYearDisplay}</h1>
      <div className="calendar-navigation">
        <button
          onClick={onPreviousMonth}
          aria-label="Previous month"
          type="button"
        >
          ←
        </button>
        <button
          onClick={onNextMonth}
          aria-label="Next month"
          type="button"
        >
          →
        </button>
        <button
          onClick={onCurrentMonth}
          className="today-button"
          aria-label="Go to current month"
          type="button"
        >
          Today
        </button>
      </div>
    </div>
  );
}
