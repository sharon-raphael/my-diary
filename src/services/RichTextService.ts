import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import type { RawDraftContentState } from 'draft-js';

/**
 * Service for serializing and deserializing rich text content
 */
export class RichTextService {
  /**
   * Serialize EditorState to JSON string
   * @param editorState - Draft.js EditorState
   * @returns JSON string representation
   */
  static serializeContent(editorState: EditorState): string {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    return JSON.stringify(raw);
  }

  /**
   * Deserialize JSON string to EditorState
   * @param content - JSON string representation
   * @returns Draft.js EditorState
   */
  static deserializeContent(content: string): EditorState {
    try {
      if (!content || content.trim() === '') {
        return EditorState.createEmpty();
      }

      const raw: RawDraftContentState = JSON.parse(content);
      const contentState = convertFromRaw(raw);
      return EditorState.createWithContent(contentState);
    } catch (error) {
      console.error('Failed to deserialize content:', error);
      // Return empty editor state on error
      return EditorState.createEmpty();
    }
  }

  /**
   * Get plain text from EditorState
   * @param editorState - Draft.js EditorState
   * @returns Plain text content
   */
  static getPlainText(editorState: EditorState): string {
    return editorState.getCurrentContent().getPlainText('\n');
  }

  /**
   * Get plain text from serialized content
   * @param content - JSON string representation
   * @returns Plain text content
   */
  static getPlainTextFromSerialized(content: string): string {
    try {
      const editorState = this.deserializeContent(content);
      return this.getPlainText(editorState);
    } catch (error) {
      return '';
    }
  }

  /**
   * Check if content is empty
   * @param editorState - Draft.js EditorState
   * @returns True if content is empty
   */
  static isEmpty(editorState: EditorState): boolean {
    const contentState = editorState.getCurrentContent();
    return !contentState.hasText();
  }

  /**
   * Get character count from EditorState
   * @param editorState - Draft.js EditorState
   * @returns Character count
   */
  static getCharacterCount(editorState: EditorState): number {
    return editorState.getCurrentContent().getPlainText('').length;
  }
}
