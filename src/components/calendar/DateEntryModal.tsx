import { useEffect, useRef } from 'react';
import type { Entry } from '../../types';

/**
 * Props for DateEntryModal component
 */
export interface DateEntryModalProps {
  date: Date;
  entries: Entry[];
  onSelectEntry: (entryId: string) => void;
  onClose: () => void;
}

/**
 * Displays list of entries when multiple entries exist for a date
 * Features:
 * - Modal overlay with backdrop
 * - List of entry titles with timestamps
 * - Entry selection to navigate to viewer
 * - Close button and backdrop click handling
 * - Focus management and keyboard navigation (Escape to close)
 * - ARIA attributes for accessibility
 */
export function DateEntryModal({
  date,
  entries,
  onSelectEntry,
  onClose,
}: DateEntryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management: focus the close button when modal opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  /**
   * Handle entry selection
   */
  const handleEntryClick = (entryId: string) => {
    onSelectEntry(entryId);
  };

  /**
   * Handle backdrop click to close modal
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="date-entry-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="date-entry-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">
            Entries for {date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="modal-entry-item"
              onClick={() => handleEntryClick(entry.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleEntryClick(entry.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View entry: ${entry.title}`}
            >
              <h3>{entry.title}</h3>
              <p className="entry-time">
                {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
