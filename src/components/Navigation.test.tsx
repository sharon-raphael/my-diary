import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import type { ViewType } from '../contexts/AppContext';

describe('Navigation', () => {
  const defaultProps = {
    currentView: 'calendar' as ViewType,
    onViewChange: vi.fn(),
    onSettings: vi.fn(),
  };

  it('renders correctly with title and settings', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getByText('My Diary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('shows static navigation buttons', () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getByRole('button', { name: /calendar view/i })).toHaveTextContent('📅 Calendar');
    expect(screen.getByRole('button', { name: /gallery view/i })).toHaveTextContent('🖼️ Gallery');
    expect(screen.getByRole('button', { name: /list view/i })).toHaveTextContent('📋 List');
    expect(screen.getByRole('button', { name: /reports view/i })).toHaveTextContent('📊 Reports');
  });

  it('highlights the current view button', () => {
    const { rerender } = render(<Navigation {...defaultProps} currentView="calendar" />);
    expect(screen.getByRole('button', { name: /calendar view/i })).toHaveClass('btn-primary');
    expect(screen.getByRole('button', { name: /gallery view/i })).toHaveClass('btn-secondary');

    rerender(<Navigation {...defaultProps} currentView="gallery" />);
    expect(screen.getByRole('button', { name: /calendar view/i })).toHaveClass('btn-secondary');
    expect(screen.getByRole('button', { name: /gallery view/i })).toHaveClass('btn-primary');
  });

  it('calls onViewChange correctly when clicking buttons', () => {
    const onViewChange = vi.fn();
    render(<Navigation {...defaultProps} currentView="calendar" onViewChange={onViewChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /gallery view/i }));
    expect(onViewChange).toHaveBeenCalledWith('gallery');

    fireEvent.click(screen.getByRole('button', { name: /list view/i }));
    expect(onViewChange).toHaveBeenCalledWith('list');

    fireEvent.click(screen.getByRole('button', { name: /reports view/i }));
    expect(onViewChange).toHaveBeenCalledWith('reports');
  });
});
