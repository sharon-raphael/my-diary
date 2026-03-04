import { useState, useEffect } from 'react';
import { EditorState } from 'draft-js';
import type { Entry, Mood } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { MoodSelector } from './MoodSelector';
import { TagInput } from './TagInput';
import { RichTextService } from '../services/RichTextService';
import { generateTitle } from '../utils/titleGenerator';
import './EntryEditor.css';

export interface EntryEditorProps {
  /** Entry to edit (undefined for new entries) */
  entry?: Entry;
  /** Callback when entry is saved */
  onSave: (entry: Omit<Entry, 'id' | 'createdAt' | 'lastModifiedAt' | 'version'>) => void;
  /** Callback when editing is cancelled */
  onCancel: () => void;
}

export function EntryEditor({ entry, onSave, onCancel }: EntryEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [editorState, setEditorState] = useState(() => {
    if (entry?.content) {
      return RichTextService.deserializeContent(entry.content);
    }
    return EditorState.createEmpty();
  });
  const [mood, setMood] = useState<Mood | null>(entry?.mood || null);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [isDirty, setIsDirty] = useState(false);

  // Track dirty state
  useEffect(() => {
    const currentContent = RichTextService.serializeContent(editorState);
    const hasChanges = 
      title !== (entry?.title || '') || 
      currentContent !== (entry?.content || '') ||
      mood !== (entry?.mood || null) ||
      JSON.stringify(tags) !== JSON.stringify(entry?.tags || []);
    setIsDirty(hasChanges);
  }, [title, editorState, mood, tags, entry]);

  const handleSave = () => {
    const serializedContent = RichTextService.serializeContent(editorState);
    const plainText = RichTextService.getPlainText(editorState);
    
    // Auto-generate title if empty
    const finalTitle = title.trim() || generateTitle(plainText);

    onSave({
      title: finalTitle,
      content: serializedContent,
      mood,
      tags,
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
        <div className="form-group">
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

        <MoodSelector value={mood} onChange={setMood} />

        <TagInput tags={tags} onChange={setTags} />

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
    </div>
  );
}
