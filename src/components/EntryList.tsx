import React, { useState } from 'react';
import type { Entry, Mood, SortOrder } from '../types';
import './EntryList.css';
import './calendar/CalendarView.css';

/**
 * Props for the EntryList component
 */
export interface EntryListProps {
  /** Array of entries to display */
  entries: Entry[];
  /** Handler called when an entry is selected */
  onSelectEntry: (entryId: string) => void;
  /** Handler called when an entry is deleted */
  onDeleteEntry: (entryId: string) => void;
  /** Search query string */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Current SortOrder value */
  sortOrder?: SortOrder;
  /** Sort order change handler */
  onSortChange?: (order: SortOrder) => void;
}

/**
 * Mood emoji mapping for visual indicators
 */
const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  anxious: '😰',
  calm: '😌',
  grateful: '🙏',
  reflective: '🤔',
  energetic: '⚡'
};

/**
 * Formats a timestamp into a human-readable date string
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Today
  if (diffInDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  }

  // Yesterday
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  }

  // Within the last week
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Older dates
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * EntryList component displays all journal entries with sorting and filtering.
 * Shows entry title, creation date, and mood indicator for each entry.
 * Provides delete functionality with confirmation dialog.
 * 
 * Validates: Requirements 1.5, 2.1, 3.1, 6.6, 9.2, 13.4
 */
export function EntryList({
  entries,
  onSelectEntry,
  onDeleteEntry,
  searchQuery = '',
  onSearchChange,
  sortOrder = 'createdAt-desc',
  onSortChange
}: EntryListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /**
   * Handles the delete button click - shows confirmation dialog
   */
  const handleDeleteClick = (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent entry selection
    setDeleteConfirmId(entryId);
  };

  /**
   * Handles delete confirmation
   */
  const handleConfirmDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent entry selection
    if (deleteConfirmId) {
      onDeleteEntry(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  /**
   * Handles delete cancellation
   */
  const handleCancelDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent entry selection
    setDeleteConfirmId(null);
  };

  /**
   * Handles entry card click
   */
  const handleEntryClick = (entryId: string) => {
    // Don't select if we're in delete confirmation mode
    if (deleteConfirmId !== entryId) {
      onSelectEntry(entryId);
    }
  };

  return (
    <div className="entry-list">
      <div className="calendar-header">
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#2c3e50' }}>Journal Entries</h2>

        <div className="calendar-navigation" style={{ background: 'transparent', boxShadow: 'none' }}>
          {onSearchChange && (
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  background: 'linear-gradient(135deg, #fdfdfd, #f0f4f8)',
                  border: '1px solid #e1e8ed',
                  padding: '10px 16px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#2c3e50',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  outline: 'none',
                  minWidth: '250px'
                }}
              />
            </div>
          )}

          {onSortChange && (
            <div className="calendar-header-selectors">
              <select
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value as SortOrder)}
                aria-label="Sort entries"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="modifiedAt-desc">Recently Mod</option>
                <option value="modifiedAt-asc">Least Rec Mod</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No entries yet. Start writing your first journal entry!</p>
        </div>
      ) : (
        <div className="entries-container">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="entry-card"
              onClick={() => handleEntryClick(entry.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleEntryClick(entry.id);
                }
              }}
              aria-label={`Entry: ${entry.title}`}
            >
              <div className="entry-card-content">
                <div className="entry-header">
                  <h3 className="entry-title">
                    {entry.mood && (
                      <span
                        className="mood-indicator"
                        role="img"
                        aria-label={`Mood: ${entry.mood}`}
                      >
                        {MOOD_EMOJIS[entry.mood]}
                      </span>
                    )}
                    {entry.title}
                  </h3>
                  <span className="entry-date">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                {deleteConfirmId === entry.id ? (
                  <div className="delete-confirmation">
                    <p>Delete this entry?</p>
                    <div className="confirmation-buttons">
                      <button
                        className="confirm-delete-button"
                        onClick={handleConfirmDelete}
                        aria-label="Confirm delete"
                      >
                        Delete
                      </button>
                      <button
                        className="cancel-delete-button"
                        onClick={handleCancelDelete}
                        aria-label="Cancel delete"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(entry.id, e)}
                    aria-label={`Delete entry: ${entry.title}`}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
