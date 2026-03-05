import { useState } from 'react';
import type { Entry } from '../../types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { DateEntryModal } from './DateEntryModal';
import { getDateKey } from '../../utils/dateUtils';
import './CalendarView.css';

/**
 * Props for CalendarView component
 */
export interface CalendarViewProps {
  entries: Entry[];
  onSelectEntry: (entryId: string) => void;
  onCreateEntry: (date?: Date) => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Main container component for the calendar view
 * Displays a monthly calendar with entry indicators and navigation
 */
export function CalendarView({
  entries,
  onSelectEntry,
  onCreateEntry,
  loading = false,
  error = null,
  onRetry,
}: CalendarViewProps) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);

  /**
   * Filters entries for the currently selected month
   */
  const getEntriesForMonth = (month: number, year: number): Entry[] => {
    const monthStr = String(month + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return entries.filter((entry) => entry.date.startsWith(prefix));
  };

  /**
   * Filters entries for a specific date
   */
  const getEntriesForDate = (date: Date): Entry[] => {
    const dateKey = getDateKey(date);
    return entries.filter((entry) => entry.date === dateKey);
  };

  const handleDateClick = (date: Date) => {
    const dateEntries = getEntriesForDate(date);

    if (dateEntries.length === 0) {
      // No entries - provide option to create
      onCreateEntry(date);
    } else if (dateEntries.length === 1) {
      // Single entry - navigate directly to viewer
      onSelectEntry(dateEntries[0].id);
    } else {
      // Multiple entries - show modal
      setSelectedDate(date);
      setShowDateModal(true);
    }
  };

  /**
   * Navigates to the previous month
   */
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  /**
   * Navigates to the next month
   */
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  /**
   * Returns to the current month
   */
  const handleCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  /**
   * Closes the date entry modal
   */
  const handleCloseModal = () => {
    setShowDateModal(false);
    setSelectedDate(null);
  };

  /**
   * Handles entry selection from modal
   */
  const handleSelectEntry = (entryId: string) => {
    handleCloseModal();
    onSelectEntry(entryId);
  };

  /**
   * Handles retry button click
   */
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Get entries for the current month
  const monthEntries = getEntriesForMonth(selectedMonth, selectedYear);

  // Error state display
  if (error) {
    console.error('CalendarView error:', error);
    return (
      <div className="calendar-view">
        <h1>Calendar View</h1>
        <div className="calendar-error">
          <div className="error-message">
            <h2>Failed to load journal entries</h2>
            <p>{error.message || 'An unexpected error occurred'}</p>
            {onRetry && (
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state display
  if (loading) {
    return (
      <div className="calendar-view">
        <h1>Calendar View</h1>
        <div className="calendar-loading">
          <p>Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      <h1>Calendar View</h1>
      <CalendarHeader
        month={selectedMonth}
        year={selectedYear}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onCurrentMonth={handleCurrentMonth}
      />
      <CalendarGrid
        month={selectedMonth}
        year={selectedYear}
        entries={monthEntries}
        currentDate={now}
        onDateClick={handleDateClick}
      />
      {showDateModal && selectedDate && (
        <DateEntryModal
          date={selectedDate}
          entries={getEntriesForDate(selectedDate)}
          onSelectEntry={handleSelectEntry}
          onClose={handleCloseModal}
          onCreateEntry={() => {
            handleCloseModal();
            onCreateEntry(selectedDate);
          }}
        />
      )}
    </div>
  );
}
