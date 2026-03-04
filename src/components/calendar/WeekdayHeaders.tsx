/**
 * Props for WeekdayHeaders component
 */
export interface WeekdayHeadersProps {
  locale?: string;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

/**
 * Displays day-of-week column headers
 */
export function WeekdayHeaders({
  locale = 'en-US',
  weekStartsOn = 0,
}: WeekdayHeadersProps) {
  // Generate array of 7 weekday names in the correct order
  const weekdays: string[] = [];
  
  // Create a date that falls on a Sunday (Jan 7, 2024 is a Sunday)
  const baseSunday = new Date(2024, 0, 7);
  
  // Generate 7 weekday names starting from the configured start day
  for (let i = 0; i < 7; i++) {
    const dayOffset = weekStartsOn + i;
    const date = new Date(baseSunday);
    date.setDate(baseSunday.getDate() + dayOffset);
    
    // Format the weekday name using the specified locale
    const weekdayName = date.toLocaleDateString(locale, { weekday: 'short' });
    weekdays.push(weekdayName);
  }
  
  return (
    <div className="weekday-headers">
      {weekdays.map((day, index) => (
        <div key={index} className="weekday-header">
          {day}
        </div>
      ))}
    </div>
  );
}
