import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import type { ViewType } from '../contexts/AppContext';

describe('Navigation', () => {
  const defaultProps = {
    onCreateEntry: vi.fn(),
    currentView: 'list' as ViewType,
    onViewChange: vi.fn(),
  };

  it('renders correctly with title and settings', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getByText('My Diary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('shows toggle for calendar when in list view', () => {
    render(<Navigation {...defaultProps} currentView="list" />);
    const toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    expect(toggleBtn).toHaveTextContent('📅 Calendar');
  });

  it('shows toggle for list when in calendar view', () => {
    render(<Navigation {...defaultProps} currentView="calendar" />);
    const toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    expect(toggleBtn).toHaveTextContent('📋 List');
  });

  it('calls onViewChange with opposite view context when toggle clicked', () => {
    const onViewChange = vi.fn();

    // Testing List -> Calendar
    const { rerender } = render(<Navigation {...defaultProps} currentView="list" onViewChange={onViewChange} />);
    let toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    fireEvent.click(toggleBtn);
    expect(onViewChange).toHaveBeenCalledWith('calendar');

    // Testing Calendar -> List
    onViewChange.mockClear();
    rerender(<Navigation {...defaultProps} currentView="calendar" onViewChange={onViewChange} />);
    toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    fireEvent.click(toggleBtn);
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('renders Create Entry button only on list view', () => {
    const { rerender } = render(<Navigation {...defaultProps} currentView="list" />);
    expect(screen.getByRole('button', { name: /create new entry/i })).toBeInTheDocument();

    rerender(<Navigation {...defaultProps} currentView="calendar" />);
    expect(screen.queryByRole('button', { name: /create new entry/i })).not.toBeInTheDocument();
  });
});
