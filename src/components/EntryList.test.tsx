import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntryList } from './EntryList';
import type { Entry } from '../types';

describe('EntryList', () => {
  const mockEntries: Entry[] = [
    {
      id: '1',
      title: 'First Entry',
      date: '2024-01-15',
      content: 'Content of first entry',
      createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      lastModifiedAt: Date.now() - 1000 * 60 * 60 * 24,
      mood: 'happy',
      tags: ['test'],
      version: 1,
    },
    {
      id: '2',
      title: 'Second Entry',
      date: '2024-01-16',
      content: 'Content of second entry',
      createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      lastModifiedAt: Date.now() - 1000 * 60 * 60,
      mood: null,
      tags: [],
      version: 1,
    },
  ];

  const mockHandlers = {
    onSelectEntry: vi.fn(),
    onDeleteEntry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with entries', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('First Entry')).toBeInTheDocument();
    expect(screen.getByText('Second Entry')).toBeInTheDocument();
  });



  it('should display mood indicator for entries with mood', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const moodIndicator = screen.getByRole('img', { name: /mood: happy/i });
    expect(moodIndicator).toBeInTheDocument();
    expect(moodIndicator.textContent).toBe('😊');
  });

  it('should not display mood indicator for entries without mood', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const moodIndicators = screen.queryAllByRole('img', { name: /mood:/i });
    expect(moodIndicators).toHaveLength(1); // Only one entry has mood
  });

  it('should display creation date in human-readable format', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    // Check that dates are displayed (not raw timestamps)
    expect(screen.getByText(/Yesterday at/i)).toBeInTheDocument();
    expect(screen.getByText(/Today at/i)).toBeInTheDocument();
  });

  it('should call onSelectEntry when entry card is clicked', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const entryCards = screen.getAllByRole('button');
    const firstEntryCard = entryCards.find(card => card.getAttribute('aria-label') === 'Entry: First Entry');

    expect(firstEntryCard).toBeDefined();
    fireEvent.click(firstEntryCard!);

    expect(mockHandlers.onSelectEntry).toHaveBeenCalledWith('1');
  });

  it('should show delete confirmation dialog when delete button is clicked', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const deleteButtons = screen.getAllByLabelText(/delete entry:/i);
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument();
  });

  it('should call onDeleteEntry when delete is confirmed', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete entry:/i);
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmButton);

    expect(mockHandlers.onDeleteEntry).toHaveBeenCalledWith('1');
  });

  it('should hide confirmation dialog when delete is cancelled', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete entry:/i);
    fireEvent.click(deleteButtons[0]);

    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: /cancel delete/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Delete this entry?')).not.toBeInTheDocument();
    expect(mockHandlers.onDeleteEntry).not.toHaveBeenCalled();
  });

  it('should not call onSelectEntry when delete button is clicked', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const deleteButtons = screen.getAllByLabelText(/delete entry:/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockHandlers.onSelectEntry).not.toHaveBeenCalled();
  });

  it('should display empty state when no entries', () => {
    render(<EntryList entries={[]} {...mockHandlers} />);

    expect(screen.getByText(/no entries yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start writing your first journal entry/i)).toBeInTheDocument();
  });

  it('should support keyboard navigation for entry selection', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const entryCards = screen.getAllByRole('button');
    const firstEntryCard = entryCards.find(card => card.getAttribute('aria-label') === 'Entry: First Entry');

    expect(firstEntryCard).toBeDefined();
    fireEvent.keyDown(firstEntryCard!, { key: 'Enter' });

    expect(mockHandlers.onSelectEntry).toHaveBeenCalledWith('1');
  });

  it('should support space key for entry selection', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const entryCards = screen.getAllByRole('button');
    const firstEntryCard = entryCards.find(card => card.getAttribute('aria-label') === 'Entry: First Entry');

    expect(firstEntryCard).toBeDefined();
    fireEvent.keyDown(firstEntryCard!, { key: ' ' });

    expect(mockHandlers.onSelectEntry).toHaveBeenCalledWith('1');
  });

  it('should display all entry titles', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    mockEntries.forEach(entry => {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
    });
  });

  it('should render delete button for each entry', () => {
    render(<EntryList entries={mockEntries} {...mockHandlers} />);

    const deleteButtons = screen.getAllByLabelText(/delete entry:/i);
    expect(deleteButtons).toHaveLength(mockEntries.length);
  });
});
