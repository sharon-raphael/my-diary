import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateCell } from './DateCell';
import type { Entry } from '../../types';

const createMockEntry = (id: string): Entry => ({
  id,
  title: 'Test Entry',
  date: '2024-01-15',
  content: 'Content',
  createdAt: 0,
  lastModifiedAt: 0,
  mood: null,
  tags: [],
  version: 1,
});

describe('DateCell', () => {
  const mockOnClick = vi.fn();
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render the date number', () => {
    render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('15')).toBeDefined();
  });

  it('should apply current-month class when isCurrentMonth is true', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.classList.contains('current-month')).toBe(true);
    expect(dateCell?.classList.contains('adjacent-month')).toBe(false);
  });

  it('should apply adjacent-month class when isCurrentMonth is false', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={false}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.classList.contains('adjacent-month')).toBe(true);
    expect(dateCell?.classList.contains('current-month')).toBe(false);
  });

  it('should apply today class when isToday is true', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={true}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.classList.contains('today')).toBe(true);
  });

  it('should not apply today class when isToday is false', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.classList.contains('today')).toBe(false);
  });

  it('should not display entry indicator when entryCount is 0', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const indicator = container.querySelector('.entry-indicator');
    expect(indicator).toBeNull();
  });

  it('should display entry indicator when entryCount is 1', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1')]}
        onClick={mockOnClick}
      />
    );

    const indicator = container.querySelector('.entry-indicator');
    expect(indicator).toBeDefined();
  });

  it('should not display entry count when entryCount is 1', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1')]}
        onClick={mockOnClick}
      />
    );

    const entryCount = container.querySelector('.entry-count');
    expect(entryCount).toBeNull();
  });

  it('should display entry count when entryCount is greater than 1', () => {
    render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1'), createMockEntry('2'), createMockEntry('3')]}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('3')).toBeDefined();
  });

  it('should call onClick with date when clicked', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    fireEvent.click(dateCell!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(testDate);
  });

  it('should call onClick when Enter key is pressed', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    fireEvent.keyDown(dateCell!, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(testDate);
  });

  it('should call onClick when Space key is pressed', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    fireEvent.keyDown(dateCell!, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(testDate);
  });

  it('should not call onClick for other keys', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    fireEvent.keyDown(dateCell!, { key: 'a' });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should have role="gridcell" for accessibility', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.getAttribute('role')).toBe('gridcell');
  });

  it('should be keyboard focusable with tabIndex', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.getAttribute('tabIndex')).toBe('0');
  });

  it('should have appropriate ARIA label with no entries', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.getAttribute('aria-label')).toBe('January 15, 2024');
  });

  it('should have appropriate ARIA label with 1 entry', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1')]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.getAttribute('aria-label')).toBe('January 15, 2024, 1 entry');
  });

  it('should have appropriate ARIA label with multiple entries', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1'), createMockEntry('2'), createMockEntry('3'), createMockEntry('4'), createMockEntry('5')]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.getAttribute('aria-label')).toBe('January 15, 2024, 5 entries');
  });

  it('should apply has-entries class when entryCount > 0', () => {
    const { container } = render(
      <DateCell
        date={testDate}
        isCurrentMonth={true}
        isToday={false}
        entries={[createMockEntry('1'), createMockEntry('2')]}
        onClick={mockOnClick}
      />
    );

    const dateCell = container.querySelector('.date-cell');
    expect(dateCell?.classList.contains('has-entries')).toBe(true);
  });

  it('should render correctly for first day of month', () => {
    const firstDay = new Date(2024, 0, 1);
    render(
      <DateCell
        date={firstDay}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
  });

  it('should render correctly for last day of month', () => {
    const lastDay = new Date(2024, 0, 31);
    render(
      <DateCell
        date={lastDay}
        isCurrentMonth={true}
        isToday={false}
        entries={[]}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('31')).toBeDefined();
  });
});
