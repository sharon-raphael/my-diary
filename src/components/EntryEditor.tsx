import { useState, useEffect } from 'react';
import { EditorState } from 'draft-js';
import type { Entry, Mood } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { MoodSelector } from './MoodSelector';
import { TagInput } from './TagInput';
import { RichTextService } from '../services/RichTextService';
import { generateTitle } from '../utils/titleGenerator';
import { getCalendarDate } from '../utils/dateFormatter';
import { MediaUploader, type PendingMedia } from './MediaUploader';
import { mediaService } from '../services/MediaService';
import type { EntryMedia } from '../types';
import './EntryEditor.css';

export interface EntryEditorProps {
  /** Entry to edit (undefined for new entries) */
  entry?: Entry;
  /** Explicit initial date provided (YYYY-MM-DD), overriding today's date */
  initialDate?: string;
  /** Callback when entry is saved */
  onSave: (entry: Omit<Entry, 'id' | 'createdAt' | 'lastModifiedAt' | 'version'>) => void;
  /** Callback when editing is cancelled */
  onCancel: () => void;
}

export function EntryEditor({ entry, initialDate, onSave, onCancel }: EntryEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [date, setDate] = useState(entry?.date || initialDate || getCalendarDate(Date.now()));
  const [editorState, setEditorState] = useState(() => {
    if (entry?.content) {
      return RichTextService.deserializeContent(entry.content);
    }
    return EditorState.createEmpty();
  });
  const [mood, setMood] = useState<Mood | null>(entry?.mood || null);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Load existing media URLs
  useEffect(() => {
    if (entry?.media) {
      Promise.all(
        entry.media.map(async (m) => {
          const url = await mediaService.getMediaUrl(m.id);
          return { ...m, url: url || undefined };
        })
      ).then(setMedia);
    }
  }, [entry?.media]);

  // Track dirty state
  useEffect(() => {
    const currentContent = RichTextService.serializeContent(editorState);
    const hasChanges =
      title !== (entry?.title || '') ||
      date !== (entry?.date || initialDate || getCalendarDate(Date.now())) ||
      currentContent !== (entry?.content || '') ||
      mood !== (entry?.mood || null) ||
      JSON.stringify(tags) !== JSON.stringify(entry?.tags || []) ||
      JSON.stringify(media.map(m => m.id)) !== JSON.stringify((entry?.media || []).map(m => m.id));
    setIsDirty(hasChanges);
  }, [title, date, editorState, mood, tags, media, entry, initialDate]);

  const handleSave = async () => {
    const serializedContent = RichTextService.serializeContent(editorState);
    const plainText = RichTextService.getPlainText(editorState);

    // Auto-generate title if empty
    const finalTitle = title.trim() || generateTitle(plainText);

    // Save blobs for newly added media
    for (const m of media) {
      if (m.file) {
        await mediaService.saveMedia(m.id, m.file);
      }
    }

    const finalMedia: EntryMedia[] = media.map(({ id, type, name }) => ({ id, type, name }));

    onSave({
      title: finalTitle,
      date,
      content: serializedContent,
      mood,
      tags,
      media: finalMedia,
    });
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <div className="entry-editor">
      <div className="entry-editor-header">
        <h2>{entry ? 'Edit Entry' : 'New Entry'}</h2>
      </div>

      <div className="entry-editor-form">
        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="entry-title">Title</label>
            <input
              id="entry-title"
              type="text"
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title (or leave blank for auto-title)..."
              maxLength={200}
            />
            <span className="char-count">{title.length}/200</span>
          </div>

          <div className="form-group date-picker-group">
            <label htmlFor="entry-date">Date</label>
            <input
              id="entry-date"
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <MoodSelector value={mood} onChange={setMood} />

        <TagInput tags={tags} onChange={setTags} />

        <div className="form-group">
          <MediaUploader media={media} onChange={setMedia} />
        </div>

        <div className="form-group">
          <label>Content</label>
          <RichTextEditor
            initialContent={editorState}
            onChange={setEditorState}
            placeholder="Write your thoughts..."
            maxLength={100000}
          />
        </div>
      </div>

      <div className="entry-editor-actions">
        <button
          className="btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save Entry
        </button>
      </div>
    </div >
  );
}
