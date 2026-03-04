import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WeekdayHeaders } from './WeekdayHeaders';

describe('WeekdayHeaders', () => {
  it('should render 7 weekday headers', () => {
    const { container } = render(<WeekdayHeaders />);
    const headers = container.querySelectorAll('.weekday-header');
    expect(headers).toHaveLength(7);
  });

  it('should render weekdays starting with Sunday by default', () => {
    const { container } = render(<WeekdayHeaders />);
    const headers = container.querySelectorAll('.weekday-header');
    
    // Default locale is en-US, so we expect Sun, Mon, Tue, Wed, Thu, Fri, Sat
    expect(headers[0].textContent).toBe('Sun');
    expect(headers[1].textContent).toBe('Mon');
    expect(headers[2].textContent).toBe('Tue');
    expect(headers[3].textContent).toBe('Wed');
    expect(headers[4].textContent).toBe('Thu');
    expect(headers[5].textContent).toBe('Fri');
    expect(headers[6].textContent).toBe('Sat');
  });

  it('should render weekdays starting with Monday when weekStartsOn is 1', () => {
    const { container } = render(<WeekdayHeaders weekStartsOn={1} />);
    const headers = container.querySelectorAll('.weekday-header');
    
    // Should start with Monday
    expect(headers[0].textContent).toBe('Mon');
    expect(headers[1].textContent).toBe('Tue');
    expect(headers[2].textContent).toBe('Wed');
    expect(headers[3].textContent).toBe('Thu');
    expect(headers[4].textContent).toBe('Fri');
    expect(headers[5].textContent).toBe('Sat');
    expect(headers[6].textContent).toBe('Sun');
  });

  it('should support different locales', () => {
    const { container } = render(<WeekdayHeaders locale="es-ES" />);
    const headers = container.querySelectorAll('.weekday-header');
    
    // Spanish locale should show abbreviated Spanish day names
    expect(headers[0].textContent).toMatch(/dom|D/i); // domingo
    expect(headers[1].textContent).toMatch(/lun|L/i); // lunes
  });

  it('should support locale with Monday start', () => {
    const { container } = render(<WeekdayHeaders locale="fr-FR" weekStartsOn={1} />);
    const headers = container.querySelectorAll('.weekday-header');
    
    // French locale with Monday start
    expect(headers[0].textContent).toMatch(/lun|L/i); // lundi
    expect(headers[6].textContent).toMatch(/dim|D/i); // dimanche
  });

  it('should render with correct CSS classes', () => {
    const { container } = render(<WeekdayHeaders />);
    
    expect(container.querySelector('.weekday-headers')).toBeInTheDocument();
    expect(container.querySelectorAll('.weekday-header')).toHaveLength(7);
  });
});
