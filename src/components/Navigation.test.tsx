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

  it('shows toggle for gallery', () => {
    const { rerender } = render(<Navigation {...defaultProps} currentView="calendar" />);
    let toggleBtn = screen.getByRole('button', { name: /toggle gallery/i });
    expect(toggleBtn).toHaveTextContent('🖼️ Gallery');

    rerender(<Navigation {...defaultProps} currentView="gallery" />);
    toggleBtn = screen.getByRole('button', { name: /toggle gallery/i });
    expect(toggleBtn).toHaveTextContent('📅 Calendar');
  });

  it('shows toggle for list when in calendar view', () => {
    const { rerender } = render(<Navigation {...defaultProps} currentView="calendar" />);
    let toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    expect(toggleBtn).toHaveTextContent('📋 List');

    rerender(<Navigation {...defaultProps} currentView="list" />);
    toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    expect(toggleBtn).toHaveTextContent('📅 Calendar');
  });

  it('calls onViewChange correctly when toggling gallery', () => {
    const onViewChange = vi.fn();
    render(<Navigation {...defaultProps} currentView="calendar" onViewChange={onViewChange} />);
    const toggleBtn = screen.getByRole('button', { name: /toggle gallery/i });
    fireEvent.click(toggleBtn);
    expect(onViewChange).toHaveBeenCalledWith('gallery');
  });

  it('calls onViewChange correctly when toggling list view', () => {
    const onViewChange = vi.fn();
    render(<Navigation {...defaultProps} currentView="calendar" onViewChange={onViewChange} />);
    const toggleBtn = screen.getByRole('button', { name: /toggle view/i });
    fireEvent.click(toggleBtn);
    expect(onViewChange).toHaveBeenCalledWith('list');
  });
});
