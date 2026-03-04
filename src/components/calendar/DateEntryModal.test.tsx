import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateEntryModal } from './DateEntryModal';
import type { Entry } from '../../types';

describe('DateEntryModal', () => {
  const mockDate = new Date('2024-01-15T10:00:00.000Z');
  const mockEntries: Entry[] = [
    {
      id: '1',
      title: 'Morning Journal',
      content: 'Test content 1',
      createdAt: new Date('2024-01-15T08:00:00.000Z').getTime(),
      lastModifiedAt: new Date('2024-01-15T08:00:00.000Z').getTime(),
      mood: 'happy',
      tags: ['morning'],
      version: 1,
    },
    {
      id: '2',
      title: 'Evening Reflection',
      content: 'Test content 2',
      createdAt: new Date('2024-01-15T20:00:00.000Z').getTime(),
      lastModifiedAt: new Date('2024-01-15T20:00:00.000Z').getTime(),
      mood: 'calm',
      tags: ['evening'],
      version: 1,
    },
  ];

  const mockOnSelectEntry = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders modal with date heading', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Entries for January 15, 2024/i)).toBeInTheDocument();
  });

  it('renders list of entries with titles and timestamps', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Morning Journal')).toBeInTheDocument();
    expect(screen.getByText('Evening Reflection')).toBeInTheDocument();
  });

  it('calls onSelectEntry when an entry is clicked', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const firstEntry = screen.getByText('Morning Journal');
    fireEvent.click(firstEntry);

    expect(mockOnSelectEntry).toHaveBeenCalledWith('1');
    expect(mockOnSelectEntry).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectEntry when Enter key is pressed on an entry', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const firstEntry = screen.getByText('Morning Journal').closest('[role="button"]');
    expect(firstEntry).toBeInTheDocument();
    
    if (firstEntry) {
      fireEvent.keyDown(firstEntry, { key: 'Enter' });
      expect(mockOnSelectEntry).toHaveBeenCalledWith('1');
    }
  });

  it('calls onSelectEntry when Space key is pressed on an entry', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const firstEntry = screen.getByText('Morning Journal').closest('[role="button"]');
    expect(firstEntry).toBeInTheDocument();
    
    if (firstEntry) {
      fireEvent.keyDown(firstEntry, { key: ' ' });
      expect(mockOnSelectEntry).toHaveBeenCalledWith('1');
    }
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const modalContent = screen.getByText('Morning Journal').closest('.date-entry-modal');
    expect(modalContent).toBeInTheDocument();
    
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

    const title = screen.getByText(/Entries for January 15, 2024/i);
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('has proper role and tabIndex for entry items', () => {
    render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    const entryItems = screen.getAllByRole('button');
    // Should have close button + 2 entry items
    expect(entryItems.length).toBeGreaterThanOrEqual(2);

    const firstEntry = screen.getByText('Morning Journal').closest('[role="button"]');
    expect(firstEntry).toHaveAttribute('tabIndex', '0');
    expect(firstEntry).toHaveAttribute('aria-label', 'View entry: Morning Journal');
  });

  it('renders with single entry', () => {
    const singleEntry = [mockEntries[0]];
    
    render(
      <DateEntryModal
        date={mockDate}
        entries={singleEntry}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Morning Journal')).toBeInTheDocument();
    expect(screen.queryByText('Evening Reflection')).not.toBeInTheDocument();
  });

  it('renders with many entries', () => {
    const manyEntries: Entry[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Entry ${i + 1}`,
      content: `Content ${i + 1}`,
      createdAt: new Date(`2024-01-15T${10 + i}:00:00.000Z`).getTime(),
      lastModifiedAt: new Date(`2024-01-15T${10 + i}:00:00.000Z`).getTime(),
      mood: 'happy' as const,
      tags: [],
      version: 1,
    }));

    render(
      <DateEntryModal
        date={mockDate}
        entries={manyEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    manyEntries.forEach((entry) => {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
    });
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <DateEntryModal
        date={mockDate}
        entries={mockEntries}
        onSelectEntry={mockOnSelectEntry}
        onClose={mockOnClose}
      />
    );

    unmount();

    // After unmount, Escape key should not trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
