# Implementation Plan: Calendar View Feature

## Overview

This plan implements a month-based calendar interface for visualizing and accessing journal entries. The implementation extends the existing React + TypeScript application with a new 'calendar' view type, following established patterns for state management (AppContext), data access (useEntries hook), and component structure.

The calendar view provides visual entry indicators, month navigation, and multiple interaction patterns for accessing entries (single-entry direct access, multi-entry selection, and empty-date creation).

## Tasks

- [x] 1. Set up calendar infrastructure and type definitions
  - Extend ViewType union to include 'calendar'
  - Add calendar state fields to AppContext (calendarMonth, calendarYear)
  - Create date utility functions (getMonthDays, getFirstDayOfMonth, isSameDay, formatMonthYear, getDateKey, groupEntriesByDate)
  - Set up calendar component directory structure
  - _Requirements: 5.1, 6.1, 6.3_

- [ ] 2. Implement core calendar components
  - [x] 2.1 Create CalendarView container component
    - Implement CalendarView with props interface (entries, onSelectEntry, onCreateEntry)
    - Add state management (selectedMonth, selectedYear, selectedDate, showDateModal)
    - Implement getEntriesForMonth and getEntriesForDate filtering methods
    - Wire up month navigation handlers (handlePreviousMonth, handleNextMonth, handleCurrentMonth)
    - Implement handleDateClick with logic for 0/1/multiple entries
    - _Requirements: 1.1, 3.1, 3.2, 3.5, 4.1, 4.2, 4.3, 6.3_

  - [x] 2.2 Write property test for calendar grid completeness
    - **Property 1: Calendar Grid Completeness**
    - **Validates: Requirements 1.1, 1.5**

  - [x] 2.3 Write property test for month navigation
    - **Property 7: Month Navigation**
    - **Validates: Requirements 3.3, 3.4**

  - [x] 2.4 Write property test for current month navigation
    - **Property 8: Current Month Navigation**
    - **Validates: Requirements 3.6**

- [ ] 3. Implement calendar header and navigation
  - [x] 3.1 Create CalendarHeader component
    - Implement CalendarHeader with props interface (month, year, navigation callbacks)
    - Display formatted month name and year
    - Add previous month, next month, and current month buttons
    - Ensure keyboard accessibility for navigation controls
    - _Requirements: 1.3, 3.1, 3.2, 3.5_

  - [-] 3.2 Write property test for month year heading accuracy
    - **Property 3: Month Year Heading Accuracy**
    - **Validates: Requirements 1.3**

  - [ ] 3.3 Write unit tests for CalendarHeader
    - Test button click handlers
    - Test month/year display formatting
    - Test keyboard navigation
    - _Requirements: 1.3, 3.1, 3.2, 3.5_

- [ ] 4. Implement calendar grid and date cells
  - [x] 4.1 Create WeekdayHeaders component
    - Implement WeekdayHeaders with locale support
    - Display 7 day-of-week headers in correct order
    - Support configurable week start (Sunday vs Monday)
    - _Requirements: 1.2_

  - [ ] 4.2 Write property test for weekday headers display
    - **Property 2: Weekday Headers Display**
    - **Validates: Requirements 1.2**

  - [x] 4.3 Create CalendarGrid component
    - Implement CalendarGrid with props interface (month, year, entries, currentDate, onDateClick)
    - Calculate first day of month and total days
    - Generate date array with padding from adjacent months
    - Map entries to dates for indicator display
    - Render WeekdayHeaders and DateCell components
    - _Requirements: 1.1, 1.5, 2.1_

  - [x] 4.4 Create DateCell component
    - Implement DateCell with props interface (date, isCurrentMonth, isToday, entryCount, onClick)
    - Display date number with appropriate styling
    - Apply reduced opacity for adjacent month dates
    - Highlight today's date with distinct visual marker
    - Display entry indicator badge when entryCount > 0
    - Show entry count when entryCount > 1
    - Handle click events and keyboard activation
    - Add ARIA labels for accessibility
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_

  - [ ] 4.5 Write property test for today highlighting
    - **Property 4: Today Highlighting**
    - **Validates: Requirements 1.4**

  - [ ] 4.6 Write property test for entry indicator presence
    - **Property 5: Entry Indicator Presence**
    - **Validates: Requirements 2.1, 2.3**

  - [ ] 4.7 Write property test for entry count display
    - **Property 6: Entry Count Display**
    - **Validates: Requirements 2.2**

  - [ ] 4.8 Write unit tests for DateCell component
    - Test visual states (current month, adjacent month, today)
    - Test entry indicator display
    - Test click handling
    - Test keyboard accessibility
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3_

- [x] 5. Checkpoint - Ensure core calendar rendering works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement date interaction and modal
  - [x] 6.1 Create DateEntryModal component
    - Implement DateEntryModal with props interface (date, entries, onSelectEntry, onClose)
    - Display modal overlay with backdrop
    - Render list of entry titles with timestamps
    - Handle entry selection to navigate to viewer
    - Implement close button and backdrop click handling
    - Manage focus and keyboard navigation (Escape to close)
    - Add ARIA attributes for accessibility
    - _Requirements: 4.2, 4.4_

  - [ ] 6.2 Write property test for single entry date click
    - **Property 9: Single Entry Date Click**
    - **Validates: Requirements 4.1**

  - [ ] 6.3 Write property test for multiple entry date click
    - **Property 10: Multiple Entry Date Click**
    - **Validates: Requirements 4.2**

  - [ ] 6.4 Write property test for empty date click
    - **Property 11: Empty Date Click**
    - **Validates: Requirements 4.3, 7.3**

  - [ ] 6.5 Write property test for modal entry selection
    - **Property 12: Modal Entry Selection**
    - **Validates: Requirements 4.4**

  - [ ] 6.6 Write unit tests for DateEntryModal
    - Test entry list rendering
    - Test entry selection
    - Test modal closing (button and backdrop)
    - Test keyboard navigation and focus management
    - _Requirements: 4.2, 4.4_

- [ ] 7. Integrate calendar view with application
  - [x] 7.1 Update AppContext to include calendar state
    - Add calendarMonth and calendarYear to AppState interface
    - Add setCalendarMonth and setCalendarYear to AppContextValue
    - Implement state persistence logic
    - Initialize with null values (defaults to current month/year)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 7.2 Update App.tsx to render CalendarView
    - Add 'calendar' case to renderView switch statement
    - Pass entries, onSelectEntry, and onCreateEntry props
    - Wire up navigation to calendar view
    - _Requirements: 5.3_

  - [x] 7.3 Update Navigation component
    - Add calendar view button to navigation controls
    - Add active state indicator for calendar view
    - Ensure view switching works correctly
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 7.4 Write property test for view switching
    - **Property 13: View Switching**
    - **Validates: Requirements 5.3**

  - [ ] 7.5 Write property test for active view indication
    - **Property 14: Active View Indication**
    - **Validates: Requirements 5.4**

  - [ ] 7.6 Write property test for calendar state persistence
    - **Property 15: Calendar State Persistence**
    - **Validates: Requirements 6.1, 6.2**

  - [ ] 7.7 Write property test for initial calendar state
    - **Property 16: Initial Calendar State**
    - **Validates: Requirements 6.3**

- [ ] 8. Implement empty state handling
  - [x] 8.1 Add empty state logic to CalendarView
    - Ensure calendar grid displays without indicators when no entries exist
    - Maintain interactivity for all date cells in empty months
    - Ensure empty date clicks provide create option
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 8.2 Write property test for empty month display
    - **Property 17: Empty Month Display**
    - **Validates: Requirements 7.1**

  - [ ] 8.3 Write property test for empty state interactivity
    - **Property 18: Empty State Interactivity**
    - **Validates: Requirements 7.2**

  - [ ] 8.4 Write unit tests for empty state scenarios
    - Test calendar with no entries
    - Test month with no entries but other months have entries
    - Test empty date click behavior
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9. Add error handling and edge cases
  - [x] 9.1 Implement error handling for entry loading
    - Add error state display when StorageService fails
    - Provide retry option for failed loads
    - Log errors to console for debugging
    - _Requirements: 2.4_

  - [ ] 9.2 Add validation for date navigation
    - Validate month (0-11) and year (1900-2100) ranges
    - Clamp invalid values to valid ranges
    - Log warnings for invalid navigation attempts
    - _Requirements: 3.3, 3.4_

  - [-] 9.3 Handle missing entries on click
    - Check entry existence before navigation
    - Show notification if entry no longer exists
    - Refresh calendar to remove stale indicators
    - _Requirements: 4.1, 4.4_

  - [ ] 9.4 Write unit tests for error scenarios
    - Test failed entry loading
    - Test invalid month/year navigation
    - Test missing entry on click
    - Test modal rendering errors
    - _Requirements: 2.4, 3.3, 3.4, 4.1_

- [ ] 10. Checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add styling and responsive design
  - [ ] 11.1 Style CalendarView and child components
    - Apply CSS for calendar grid layout (CSS Grid)
    - Style date cells with appropriate spacing and sizing
    - Style entry indicators with badges and counts
    - Add hover and focus states for interactive elements
    - Implement today highlight styling
    - Style adjacent month dates with reduced opacity
    - _Requirements: 1.4, 1.5, 2.3_

  - [ ] 11.2 Implement responsive design
    - Add desktop styles (> 768px) with comfortable spacing
    - Add tablet styles (481-768px) with condensed grid
    - Add mobile styles (≤ 480px) with compact grid and larger touch targets
    - Ensure modal is responsive across screen sizes
    - _Requirements: 1.1, 4.2_

  - [ ] 11.3 Add accessibility enhancements
    - Implement keyboard navigation for date cells (arrow keys)
    - Add ARIA live region for month changes
    - Set role="grid" for calendar grid and role="gridcell" for date cells
    - Ensure focus management in modal (focus trap, return focus on close)
    - Test with screen readers
    - _Requirements: 1.1, 1.2, 4.2_

  - [ ] 11.4 Write accessibility tests
    - Test keyboard navigation
    - Test ARIA labels and roles
    - Test focus management
    - Test screen reader announcements
    - _Requirements: 1.1, 1.2, 4.2_

- [ ] 12. Performance optimization and validation
  - [ ] 12.1 Add performance optimizations
    - Memoize DateCell components with React.memo
    - Pre-filter entries by month in CalendarView
    - Cache calendar grid calculations when month/year unchanged
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 12.2 Validate performance requirements
    - Manually test calendar view initial render (< 200ms target)
    - Manually test month navigation (< 100ms target)
    - Manually test entry query for month (< 50ms target)
    - Manually test view switching (< 100ms target)
    - Document performance measurements
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 13. Final integration and testing
  - [ ] 13.1 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 13.2 Manual end-to-end testing
    - Test complete user flows (view calendar, navigate months, click dates, view entries)
    - Test edge cases (leap years, month boundaries, empty states)
    - Test across different screen sizes
    - Test keyboard navigation and accessibility
    - _Requirements: All_

  - [ ] 13.3 Code review and cleanup
    - Review all code for consistency with existing patterns
    - Remove any unused imports or dead code
    - Ensure TypeScript types are properly defined
    - Update any relevant documentation
    - _Requirements: All_

- [ ] 14. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests tagged with format: `// Feature: calendar-view, Property {number}: {property_text}`
- Follow existing React + TypeScript patterns from the codebase
- Leverage existing AppContext and useEntries hook patterns
- Ensure all components are properly typed with TypeScript
- Maintain accessibility standards throughout implementation
- Performance targets: initial render < 200ms, navigation < 100ms, queries < 50ms
