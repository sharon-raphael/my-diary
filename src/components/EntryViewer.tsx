import { useMemo, useState, useEffect } from 'react';
import type { Entry } from '../types';
import { RichTextService } from '../services/RichTextService';
import { getMoodOption } from './MoodSelector';
import { formatDateTime } from '../utils/dateFormatter';
import { stateToHTML } from 'draft-js-export-html';
import { mediaService } from '../services/MediaService';
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
  /** Callback when new entry is clicked */
  onCreateEntry?: () => void;
  /** Callback for navigating to previous entry (older) */
  onPrevious?: () => void;
  /** Callback for navigating to next entry (newer) */
  onNext?: () => void;
}

export function EntryViewer({ entry, onEdit, onDelete, onBack, onCreateEntry, onPrevious, onNext }: EntryViewerProps) {
  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
    if (confirmed) {
      onDelete();
    }
  };

  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry.media && entry.media.length > 0) {
      Promise.all(
        entry.media.map(async (m) => {
          const url = await mediaService.getMediaUrl(m.id);
          return { id: m.id, url };
        })
      ).then(results => {
        const urlMap: Record<string, string> = {};
        for (const res of results) {
          if (res.url) urlMap[res.id] = res.url;
        }
        setMediaUrls(urlMap);
      });
    }
  }, [entry.media]);

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
          {onCreateEntry && (
            <button className="btn btn-primary" onClick={onCreateEntry}>
              + New Entry
            </button>
          )}
          <button className="btn btn-secondary" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="entry-viewer-content">
        <header className="article-header">
          <h1 className="entry-title">{entry.title}</h1>
          <div className="article-meta">
            <span className="meta-date">{entry.date}</span>

            {moodOption && (
              <>
                <span className="meta-divider">•</span>
                <div className="mood-badge" title={`Mood: ${moodOption.label}`}>
                  <span className="mood-emoji">{moodOption.emoji}</span>
                </div>
              </>
            )}

            {entry.tags.length > 0 && (
              <>
                <span className="meta-divider">•</span>
                <div className="tags-row">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <article className="article-body">
          <div
            className="content-display"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {entry.media && entry.media.length > 0 && (
            <div className="entry-viewer-media">
              <div className="viewer-media-list">
                {entry.media.map(m => (
                  <div key={m.id} className="viewer-media-item">
                    {m.type.startsWith('image/') || m.type === 'image' ? (
                      <img src={mediaUrls[m.id] || '#'} alt={m.name} loading="lazy" />
                    ) : m.type.startsWith('video/') || m.type === 'video' ? (
                      <video src={mediaUrls[m.id] || '#'} controls preload="metadata" />
                    ) : (
                      <div className="viewer-file-placeholder">📄 {m.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <footer className="article-footer">
          <div className="footer-timestamp">Created: {formatDateTime(entry.createdAt)}</div>
          <div className="footer-timestamp">Last Modified: {formatDateTime(entry.lastModifiedAt)}</div>
        </footer>

        {(onPrevious || onNext) && (
          <nav className="entry-navigation">
            <button 
              className="nav-btn prev-btn" 
              onClick={onPrevious} 
              disabled={!onPrevious}
              aria-label="Previous Entry"
            >
              ← Previous Entry
            </button>
            <button 
              className="nav-btn next-btn" 
              onClick={onNext} 
              disabled={!onNext}
              aria-label="Next Entry"
            >
              Next Entry →
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
