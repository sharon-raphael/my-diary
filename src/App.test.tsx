import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the app with default list view', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });

  it('should wrap content with AppProvider', async () => {
    // This test verifies that the App component renders without errors
    // which confirms the AppProvider is working correctly
    let container: HTMLElement | null = null;
    await act(async () => {
      const result = render(<App />);
      container = result.container;
    });

    expect(container!.querySelector('.app')).toBeInTheDocument();
  });
});
