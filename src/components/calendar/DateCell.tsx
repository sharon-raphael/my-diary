/**
 * Props for DateCell component
 */
export interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  entryCount: number;
  onClick: (date: Date) => void;
}

/**
 * Represents a single day in the calendar grid
 * Displays the day number with appropriate styling based on state
 * Shows entry indicators when entries exist for the date
 */
export function DateCell({
  date,
  isCurrentMonth,
  isToday,
  entryCount,
  onClick,
}: DateCellProps) {
  const dayNumber = date.getDate();
  
  // Build CSS classes based on state
  const classNames = [
    'date-cell',
    isCurrentMonth ? 'current-month' : 'adjacent-month',
    isToday ? 'today' : '',
    entryCount > 0 ? 'has-entries' : '',
  ].filter(Boolean).join(' ');
  
  // Handle click events
  const handleClick = () => {
    onClick(date);
  };
  
  // Handle keyboard activation (Enter or Space)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(date);
    }
  };
  
  // Generate ARIA label for accessibility
  const ariaLabel = (() => {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    if (entryCount === 0) {
      return dateStr;
    } else if (entryCount === 1) {
      return `${dateStr}, 1 entry`;
    } else {
      return `${dateStr}, ${entryCount} entries`;
    }
  })();
  
  return (
    <div
      className={classNames}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <span className="date-number">{dayNumber}</span>
      {entryCount > 0 && (
        <span className="entry-indicator">
          {entryCount > 1 && (
            <span className="entry-count">{entryCount}</span>
          )}
        </span>
      )}
    </div>
  );
}
