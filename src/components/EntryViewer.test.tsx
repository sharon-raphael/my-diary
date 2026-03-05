import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntryViewer } from './EntryViewer';
import type { Entry } from '../types';

vi.mock('../services/RichTextService', () => ({
  RichTextService: {
    deserializeContent: vi.fn((content) => ({
      getCurrentContent: vi.fn(() => content || '')
    })),
    serializeContent: vi.fn((content) => content),
    getPlainText: vi.fn((content) => content || ''),
  }
}));

vi.mock('draft-js-export-html', () => ({
  stateToHTML: vi.fn((content) => content)
}));

describe('EntryViewer', () => {
  const mockEntry: Entry = {
    id: '123',
    title: 'Test Entry',
    date: '2024-01-01',
    content: 'This is test content',
    createdAt: 1704067200000, // 2024-01-01 00:00:00
    lastModifiedAt: 1704153600000, // 2024-01-02 00:00:00
    mood: 'happy',
    tags: ['test', 'journal'],
    version: 1,
  };

  const mockCallbacks = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onBack: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays entry title', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText('Test Entry')).toBeInTheDocument();
  });

  it('displays entry content', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText('This is test content')).toBeInTheDocument();
  });

  it('displays creation date', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('displays last modified date', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText(/Last Modified:/)).toBeInTheDocument();
  });

  it('displays mood when present', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText('Mood:')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
  });

  it('displays tags when present', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('journal')).toBeInTheDocument();
  });

  it('does not display metadata section when mood and tags are empty', () => {
    const entryWithoutMetadata: Entry = {
      ...mockEntry,
      mood: null,
      tags: [],
    };
    render(<EntryViewer entry={entryWithoutMetadata} {...mockCallbacks} />);
    expect(screen.queryByText('Mood:')).not.toBeInTheDocument();
    expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockCallbacks.onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back button is clicked', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);

    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    expect(mockCallbacks.onBack).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation dialog when delete button is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete this entry? This action cannot be undone.'
    );
    expect(mockCallbacks.onDelete).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('does not call onDelete when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockCallbacks.onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('has edit, delete, and back buttons', () => {
    render(<EntryViewer entry={mockEntry} {...mockCallbacks} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });
});
