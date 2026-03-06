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
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Displays month/year and navigation controls
 */
export function CalendarHeader({
  month,
  year,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  onMonthChange,
  onYearChange,
}: CalendarHeaderProps) {
  const monthYearDisplay = formatMonthYear(month, year);
  const currentYear = new Date().getFullYear();
  // Provide 20 year span
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="calendar-header">
      <h1 className="sr-only">{monthYearDisplay}</h1>
      <div className="calendar-header-selectors">
        <select
          value={month}
          onChange={(e) => onMonthChange?.(Number(e.target.value))}
          aria-label="Select Month"
          className="month-select"
        >
          {MONTHS.map((m, idx) => (
            <option key={m} value={idx}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => onYearChange?.(Number(e.target.value))}
          aria-label="Select Year"
          className="year-select"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

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
