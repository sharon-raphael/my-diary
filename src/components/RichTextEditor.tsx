import { useState, useEffect } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil
} from 'draft-js';
import type { DraftHandleValue } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  initialContent: EditorState;
  onChange: (content: EditorState) => void;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Rich text editor component wrapping Draft.js
 * Supports bold, italic, headings, and lists
 */
export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Write your thoughts...',
  maxLength = 100000
}: RichTextEditorProps) {
  const [editorState, setEditorState] = useState(initialContent);

  // Update editor state when initialContent changes
  useEffect(() => {
    setEditorState(initialContent);
  }, [initialContent]);

  /**
   * Handle editor state changes
   */
  const handleChange = (newState: EditorState) => {
    const contentLength = newState.getCurrentContent().getPlainText('').length;
    
    // Enforce character limit
    if (contentLength <= maxLength) {
      setEditorState(newState);
      onChange(newState);
    }
  };

  /**
   * Handle keyboard commands
   */
  const handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    
    return 'not-handled';
  };

  /**
   * Map key bindings
   */
  const keyBindingFn = (e: React.KeyboardEvent): string | null => {
    // Ctrl/Cmd + B for bold
    if (e.keyCode === 66 && KeyBindingUtil.hasCommandModifier(e)) {
      return 'bold';
    }
    // Ctrl/Cmd + I for italic
    if (e.keyCode === 73 && KeyBindingUtil.hasCommandModifier(e)) {
      return 'italic';
    }
    return getDefaultKeyBinding(e);
  };

  /**
   * Toggle inline style (bold, italic)
   */
  const toggleInlineStyle = (style: string) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  /**
   * Toggle block type (headings, lists)
   */
  const toggleBlockType = (blockType: string) => {
    handleChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  /**
   * Check if inline style is active
   */
  const isInlineStyleActive = (style: string): boolean => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style);
  };

  /**
   * Check if block type is active
   */
  const isBlockTypeActive = (blockType: string): boolean => {
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const currentBlock = editorState.getCurrentContent().getBlockForKey(blockKey);
    return currentBlock.getType() === blockType;
  };

  // Calculate character count
  const contentLength = editorState.getCurrentContent().getPlainText('').length;
  const isNearLimit = contentLength > maxLength * 0.9;

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={`toolbar-button ${isInlineStyleActive('BOLD') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleInlineStyle('BOLD');
          }}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          className={`toolbar-button ${isInlineStyleActive('ITALIC') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleInlineStyle('ITALIC');
          }}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className={`toolbar-button ${isBlockTypeActive('header-one') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlockType('header-one');
          }}
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          className={`toolbar-button ${isBlockTypeActive('header-two') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlockType('header-two');
          }}
          title="Heading 2"
        >
          H2
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className={`toolbar-button ${isBlockTypeActive('unordered-list-item') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlockType('unordered-list-item');
          }}
          title="Bulleted List"
        >
          • List
        </button>

        <button
          type="button"
          className={`toolbar-button ${isBlockTypeActive('ordered-list-item') ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlockType('ordered-list-item');
          }}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          placeholder={placeholder}
        />
      </div>

      <div className={`character-count ${isNearLimit ? 'warning' : ''}`}>
        {contentLength.toLocaleString()} / {maxLength.toLocaleString()} characters
      </div>
    </div>
  );
}
