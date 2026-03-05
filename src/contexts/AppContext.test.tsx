import { describe, it, expect } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

describe('AppContext', () => {
  it('should provide default state values', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    expect(result.current.entries).toEqual([]);
    expect(result.current.currentView).toBe('calendar');
    expect(result.current.selectedEntryId).toBeNull();
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortOrder).toBe('createdAt-desc');
    expect(result.current.calendarMonth).toBeNull();
    expect(result.current.calendarYear).toBeNull();
  });

  it('should update entries state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    const mockEntries = [
      {
        id: '1',
        title: 'Test Entry',
        date: '2024-01-01',
        content: 'Test content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1,
      },
    ];

    act(() => {
      result.current.setEntries(mockEntries);
    });

    expect(result.current.entries).toEqual(mockEntries);
  });

  it('should update currentView state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setCurrentView('editor');
    });

    expect(result.current.currentView).toBe('editor');
  });

  it('should update selectedEntryId state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setSelectedEntryId('test-id');
    });

    expect(result.current.selectedEntryId).toBe('test-id');
  });

  it('should update searchQuery state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setSearchQuery('test query');
    });

    expect(result.current.searchQuery).toBe('test query');
  });

  it('should update sortOrder state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setSortOrder('createdAt-asc');
    });

    expect(result.current.sortOrder).toBe('createdAt-asc');
  });

  it('should update calendarMonth state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setCalendarMonth(5);
    });

    expect(result.current.calendarMonth).toBe(5);
  });

  it('should update calendarYear state', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setCalendarYear(2024);
    });

    expect(result.current.calendarYear).toBe(2024);
  });

  it('should allow setting calendarMonth to null', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setCalendarMonth(5);
    });

    expect(result.current.calendarMonth).toBe(5);

    act(() => {
      result.current.setCalendarMonth(null);
    });

    expect(result.current.calendarMonth).toBeNull();
  });

  it('should allow setting calendarYear to null', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.setCalendarYear(2024);
    });

    expect(result.current.calendarYear).toBe(2024);

    act(() => {
      result.current.setCalendarYear(null);
    });

    expect(result.current.calendarYear).toBeNull();
  });

  it('should throw error when useAppContext is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => { };

    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');

    console.error = originalError;
  });

  it('should render children within provider', () => {
    render(
      <AppProvider>
        <div>Test Child</div>
      </AppProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
