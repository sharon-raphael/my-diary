import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntryEditor } from './EntryEditor';
import type { Entry } from '../types';

describe('EntryEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const mockEntry: Entry = {
    id: '123',
    title: 'Test Entry',
    content: 'Test content',
    createdAt: Date.now(),
    lastModifiedAt: Date.now(),
    mood: null,
    tags: [],
    version: 1,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty fields for new entry', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText('New Entry')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Content')).toHaveValue('');
  });

  it('renders with existing entry data for editing', () => {
    render(<EntryEditor entry={mockEntry} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText('Edit Entry')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Test Entry');
    expect(screen.getByLabelText('Content')).toHaveValue('Test content');
  });

  it('updates title when user types', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(titleInput).toHaveValue('New Title');
  });

  it('updates content when user types', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const contentTextarea = screen.getByLabelText('Content');
    fireEvent.change(contentTextarea, { target: { value: 'New content here' } });

    expect(contentTextarea).toHaveValue('New content here');
  });

  it('calls onSave with entry data when save button is clicked', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    const contentTextarea = screen.getByLabelText('Content');
    const saveButton = screen.getByText('Save Entry');

    fireEvent.change(titleInput, { target: { value: 'My Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'My content' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'My Title',
      content: 'My content',
      mood: null,
      tags: [],
    });
  });

  it('calls onCancel when cancel button is clicked without changes', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows confirmation dialog when cancelling with unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Changed' } });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to cancel?');
    expect(mockOnCancel).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('calls onCancel when user confirms cancellation with unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Changed' } });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('disables save button when both title and content are empty', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByText('Save Entry');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when title has content', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Title' } });

    const saveButton = screen.getByText('Save Entry');
    expect(saveButton).not.toBeDisabled();
  });

  it('enables save button when content has text', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const contentTextarea = screen.getByLabelText('Content');
    fireEvent.change(contentTextarea, { target: { value: 'Content' } });

    const saveButton = screen.getByText('Save Entry');
    expect(saveButton).not.toBeDisabled();
  });

  it('displays character count for title', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    expect(screen.getByText('4/200')).toBeInTheDocument();
  });

  it('displays character count for content', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const contentTextarea = screen.getByLabelText('Content');
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    expect(screen.getByText('12 / 1,00,000 characters')).toBeInTheDocument();
  });

  it('enforces max length of 200 characters for title', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    expect(titleInput.maxLength).toBe(200);
  });

  it('enforces max length of 100,000 characters for content', () => {
    render(<EntryEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    const contentTextarea = screen.getByLabelText('Content') as HTMLTextAreaElement;
    expect(contentTextarea.maxLength).toBe(100000);
  });

  it('preserves mood and tags from existing entry when saving', () => {
    const entryWithMetadata: Entry = {
      ...mockEntry,
      mood: 'happy',
      tags: ['personal', 'reflection'],
    };

    render(<EntryEditor entry={entryWithMetadata} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = screen.getByText('Save Entry');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Updated Title',
      content: 'Test content',
      mood: 'happy',
      tags: ['personal', 'reflection'],
    });
  });
});
