import { useMemo } from 'react';
import type { Entry } from '../types';
import { RichTextService } from '../services/RichTextService';
import { getMoodOption } from './MoodSelector';
import { formatDateTime } from '../utils/dateFormatter';
import { stateToHTML } from 'draft-js-export-html';
import './EntryViewer.css';

export interface EntryViewerProps {
  /** Entry to display */
  entry: Entry;
  /** Callback when edit button is clicked */
  onEdit: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
  /** Callback when back button is clicked */
  onBack: () => void;
}

export function EntryViewer({ entry, onEdit, onDelete, onBack }: EntryViewerProps) {
  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
    if (confirmed) {
      onDelete();
    }
  };

  // Convert rich text content to HTML for display
  const htmlContent = useMemo(() => {
    try {
      const editorState = RichTextService.deserializeContent(entry.content);
      const contentState = editorState.getCurrentContent();
      return stateToHTML(contentState);
    } catch (error) {
      console.error('Failed to render rich text:', error);
      return entry.content;
    }
  }, [entry.content]);

  const moodOption = entry.mood ? getMoodOption(entry.mood) : null;

  return (
    <div className="entry-viewer">
      <div className="entry-viewer-header">
        <button className="btn btn-back" onClick={onBack} aria-label="Go back">
          ← Back
        </button>
        <div className="entry-viewer-actions">
          <button className="btn btn-secondary" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="entry-viewer-content">
        <h1 className="entry-title">{entry.title}</h1>

        <div className="entry-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Created:</span>
            <span className="metadata-value">{formatDateTime(entry.createdAt)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Last Modified:</span>
            <span className="metadata-value">{formatDateTime(entry.lastModifiedAt)}</span>
          </div>
        </div>

        {(moodOption || entry.tags.length > 0) && (
          <div className="entry-details">
            {moodOption && (
              <div className="detail-item">
                <span className="detail-label">Mood:</span>
                <div className="mood-display">
                  <span className="mood-emoji">{moodOption.emoji}</span>
                  <span className="mood-label">{moodOption.label}</span>
                </div>
              </div>
            )}
            {entry.tags.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Tags:</span>
                <div className="tags-display">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="entry-body">
          <div 
            className="content-display"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}
