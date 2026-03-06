import React, { useEffect, useState } from 'react';
import type { Entry } from '../../types';
import { getMoodOption } from '../MoodSelector';
import { mediaService } from '../../services/MediaService';

/**
 * Props for DateCell component
 */
export interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  entries: Entry[];
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
  entries,
  onClick,
}: DateCellProps) {
  const dayNumber = date.getDate();
  const entryCount = entries.length;
  const firstEntry = entryCount > 0 ? entries[0] : null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (firstEntry?.media && firstEntry.media.length > 0) {
      // Find the first image
      const imageMedia = firstEntry.media.find(m => m.type === 'image') || firstEntry.media[0];
      mediaService.getMediaUrl(imageMedia.id).then((url) => {
        if (active && url) {
          setPreviewUrl(url);
        }
      });
    } else {
      setPreviewUrl(null);
    }
    return () => {
      active = false;
    };
  }, [firstEntry]);

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

  const moodOption = firstEntry?.mood ? getMoodOption(firstEntry.mood) : null;

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

      {firstEntry && (
        <div className="date-cell-preview">
          {entryCount === 1 ? (
            <>
              {previewUrl && (
                <div className="preview-image-container">
                  <img src={previewUrl} alt="Entry preview" className="preview-image" />
                </div>
              )}
              <div className="preview-content single-entry-preview">
                {moodOption && <span className="preview-mood">{moodOption.emoji}</span>}
                <span className="preview-title">{firstEntry.title || 'Untitled'}</span>
              </div>
            </>
          ) : (
            <div className="multi-entry-preview">
              {entries.slice(0, 2).map((entry) => {
                const mOpt = entry.mood ? getMoodOption(entry.mood) : null;
                const hasMedia = entry.media && entry.media.length > 0;
                return (
                  <div key={entry.id} className="preview-content multi-entry-row">
                    {hasMedia && <span className="preview-attachment-icon">📎</span>}
                    <span className="preview-title">{entry.title || 'Untitled'}</span>
                    {mOpt && <span className="preview-mood right-side">{mOpt.emoji}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
