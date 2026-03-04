import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import type { SortOrder } from '../types';
import type { ViewType } from '../contexts/AppContext';

describe('Navigation', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    sortOrder: 'createdAt-desc' as SortOrder,
    onSortChange: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onCreateEntry: vi.fn(),
    currentView: 'list' as ViewType,
    onViewChange: vi.fn(),
  };

  it('renders list and calendar view buttons', () => {
    render(<Navigation {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /switch to list view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to calendar view/i })).toBeInTheDocument();
  });

  it('shows active state for list view when currentView is list', () => {
    render(<Navigation {...defaultProps} currentView="list" />);
    
    const listButton = screen.getByRole('button', { name: /switch to list view/i });
    expect(listButton).toHaveClass('btn-view-active');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows active state for calendar view when currentView is calendar', () => {
    render(<Navigation {...defaultProps} currentView="calendar" />);
    
    const calendarButton = screen.getByRole('button', { name: /switch to calendar view/i });
    expect(calendarButton).toHaveClass('btn-view-active');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onViewChange with "list" when list button is clicked', () => {
    const onViewChange = vi.fn();
    
    render(<Navigation {...defaultProps} currentView="calendar" onViewChange={onViewChange} />);
    
    const listButton = screen.getByRole('button', { name: /switch to list view/i });
    fireEvent.click(listButton);
    
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('calls onViewChange with "calendar" when calendar button is clicked', () => {
    const onViewChange = vi.fn();
    
    render(<Navigation {...defaultProps} currentView="list" onViewChange={onViewChange} />);
    
    const calendarButton = screen.getByRole('button', { name: /switch to calendar view/i });
    fireEvent.click(calendarButton);
    
    expect(onViewChange).toHaveBeenCalledWith('calendar');
  });

  it('does not show active state on list button when calendar view is active', () => {
    render(<Navigation {...defaultProps} currentView="calendar" />);
    
    const listButton = screen.getByRole('button', { name: /switch to list view/i });
    expect(listButton).not.toHaveClass('btn-view-active');
    expect(listButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('does not show active state on calendar button when list view is active', () => {
    render(<Navigation {...defaultProps} currentView="list" />);
    
    const calendarButton = screen.getByRole('button', { name: /switch to calendar view/i });
    expect(calendarButton).not.toHaveClass('btn-view-active');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('maintains view switcher when other navigation actions are performed', () => {
    const onCreateEntry = vi.fn();
    
    render(<Navigation {...defaultProps} currentView="calendar" onCreateEntry={onCreateEntry} />);
    
    const createButton = screen.getByRole('button', { name: /create new entry/i });
    fireEvent.click(createButton);
    
    expect(onCreateEntry).toHaveBeenCalled();
    
    // View switcher should still be present
    expect(screen.getByRole('button', { name: /switch to list view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to calendar view/i })).toBeInTheDocument();
  });
});
