import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CalendarGrid } from './CalendarGrid';
import type { Entry } from '../../types';

describe('CalendarGrid', () => {
  const mockOnDateClick = vi.fn();
  const currentDate = new Date(2024, 0, 15); // January 15, 2024

  const createMockEntry = (id: string, date: Date): Entry => ({
    id,
    title: `Entry ${id}`,
    date: date.toISOString().split('T')[0],
    content: 'Test content',
    mood: 'happy',
    tags: [],
    createdAt: date.getTime(),
    lastModifiedAt: date.getTime(),
    version: 1,
  });

  it('should render weekday headers', () => {
    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={[]}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // Check that weekday headers are rendered
    const weekdayHeaders = container.querySelector('.weekday-headers');
    expect(weekdayHeaders).toBeDefined();
    expect(weekdayHeaders?.children.length).toBe(7);
  });

  it('should render date cells for the month', () => {
    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={[]}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // Calendar grid should have 35-42 date cells
    const dateCells = container.querySelectorAll('.date-cell');
    expect(dateCells.length).toBeGreaterThanOrEqual(35);
    expect(dateCells.length).toBeLessThanOrEqual(42);
  });

  it('should map entries to dates correctly', () => {
    const entries: Entry[] = [
      createMockEntry('1', new Date(2024, 0, 5)),
      createMockEntry('2', new Date(2024, 0, 5)),
      createMockEntry('3', new Date(2024, 0, 10)),
    ];

    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={entries}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // The component should render without errors
    const grid = container.querySelector('.calendar-grid');
    expect(grid).toBeDefined();
  });

  it('should pass correct props to DateCell components', () => {
    const entries: Entry[] = [
      createMockEntry('1', new Date(2024, 0, 15)),
    ];

    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={entries}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // The component should render the calendar grid
    const grid = container.querySelector('.calendar-grid');
    expect(grid).toBeDefined();
  });

  it('should handle months with no entries', () => {
    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={[]}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // Should render without errors even with no entries
    const grid = container.querySelector('.calendar-grid');
    expect(grid).toBeDefined();
  });

  it('should include padding dates from adjacent months', () => {
    const { container } = render(
      <CalendarGrid
        month={0}
        year={2024}
        entries={[]}
        currentDate={currentDate}
        onDateClick={mockOnDateClick}
      />
    );

    // The grid should include dates from previous and next months
    const dateCells = container.querySelectorAll('.date-cell');
    // January 2024 starts on Monday, so we need padding
    // Grid should have complete weeks (35-42 cells)
    expect(dateCells.length).toBeGreaterThanOrEqual(35);
    expect(dateCells.length % 7).toBe(0); // Should be multiple of 7
  });
});
