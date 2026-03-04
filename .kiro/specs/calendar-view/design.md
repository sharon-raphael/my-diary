# Calendar View Feature - Design Document

## Overview

The Calendar View feature provides a month-based calendar interface for visualizing and accessing journal entries. This feature integrates with the existing React + TypeScript journal application, adding a new view type alongside the existing list, editor, and viewer views.

### Key Design Goals

1. **Seamless Integration**: Extend the existing ViewType system without disrupting current functionality
2. **Performance**: Efficiently query and display entries for any month within 200ms
3. **Intuitive Navigation**: Provide clear month/year navigation with visual feedback
4. **Flexible Access**: Support single-entry direct access and multi-entry selection
5. **State Preservation**: Remember the selected month when switching between views

### Design Principles

- **Minimal State**: Leverage existing AppContext and useEntries hook patterns
- **Component Reusability**: Build composable calendar components following existing patterns
- **Type Safety**: Maintain strict TypeScript typing throughout
- **Accessibility**: Ensure keyboard navigation and screen reader support
- **Responsive Design**: Support various screen sizes with appropriate layouts

## Architecture

### High-Level Component Structure

```
App (AppProvider)
├── AppContent
    ├── CalendarView (new)
    │   ├── CalendarHeader
    │   │   ├── MonthYearDisplay
    │   │   └── NavigationControls
    │   ├── CalendarGrid
    │   │   ├── WeekdayHeaders
    │   │   └── DateCell[] (35-42 cells)
    │   └── DateEntryModal (conditional)
    ├── EntryList (existing)
    ├── EntryEditor (existing)
    └── EntryViewer (existing)
```

### Integration Points

1. **ViewType Extension**: Add 'calendar' to the existing ViewType union
2. **AppContext Enhancement**: Add calendar-specific state (selectedMonth, selectedYear)
3. **Routing Logic**: Extend App.tsx renderView() switch statement
4. **Navigation Component**: Add calendar view button to existing Navigation component
5. **useEntries Hook**: Leverage existing hook for entry data access

### Data Flow

```
StorageService (localStorage)
    ↓
useEntries hook
    ↓
entries array (in AppContent)
    ↓
CalendarView component
    ↓
[Filter by month/year] → getEntriesForMonth()
    ↓
CalendarGrid (receives filtered entries)
    ↓
DateCell components (display indicators)
    ↓
[User clicks date] → handleDateClick()
    ↓
Navigation decision:
- 0 entries → show create option
- 1 entry → navigate to viewer
- 2+ entries → show DateEntryModal
```

## Components and Interfaces

### 1. CalendarView Component

**Purpose**: Main container component for the calendar view

**Props**:
```typescript
interface CalendarViewProps {
  entries: Entry[];
  onSelectEntry: (entryId: string) => void;
  onCreateEntry: (date?: Date) => void;
}
```

**State**:
```typescript
interface CalendarViewState {
  selectedMonth: number; // 0-11
  selectedYear: number;
  selectedDate: Date | null;
  showDateModal: boolean;
}
```

**Key Methods**:
- `getEntriesForMonth(month: number, year: number): Entry[]` - Filters entries by month/year
- `getEntriesForDate(date: Date): Entry[]` - Filters entries by specific date
- `handleDateClick(date: Date): void` - Handles date cell clicks
- `handlePreviousMonth(): void` - Navigates to previous month
- `handleNextMonth(): void` - Navigates to next month
- `handleCurrentMonth(): void` - Returns to current month

### 2. CalendarHeader Component

**Purpose**: Displays month/year and navigation controls

**Props**:
```typescript
interface CalendarHeaderProps {
  month: number;
  year: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}
```

**Rendering**:
- Month name and year (e.g., "January 2024")
- Previous month button (←)
- Next month button (→)
- Current month button ("Today")

### 3. CalendarGrid Component

**Purpose**: Renders the calendar grid with date cells

**Props**:
```typescript
interface CalendarGridProps {
  month: number;
  year: number;
  entries: Entry[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
}
```

**Key Logic**:
- Calculate first day of month and total days
- Generate array of dates including padding from adjacent months
- Map entries to dates for indicator display
- Handle locale-based week start (Sunday vs Monday)

### 4. DateCell Component

**Purpose**: Represents a single day in the calendar grid

**Props**:
```typescript
interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  entryCount: number;
  onClick: (date: Date) => void;
}
```

**Visual States**:
- Default: Standard date display
- Current month: Full opacity
- Adjacent month: Reduced opacity (0.4)
- Today: Highlighted with border/background
- Has entries: Shows entry indicator badge with count

### 5. DateEntryModal Component

**Purpose**: Displays list of entries when multiple entries exist for a date

**Props**:
```typescript
interface DateEntryModalProps {
  date: Date;
  entries: Entry[];
  onSelectEntry: (entryId: string) => void;
  onClose: () => void;
}
```

**Features**:
- Modal overlay with backdrop
- List of entry titles with timestamps
- Click to navigate to entry viewer
- Close button and backdrop click to dismiss

### 6. WeekdayHeaders Component

**Purpose**: Displays day-of-week column headers

**Props**:
```typescript
interface WeekdayHeadersProps {
  locale?: string;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}
```

## Data Models

### Extended ViewType

```typescript
export type ViewType = 'list' | 'editor' | 'viewer' | 'calendar';
```

### Calendar State in AppContext

```typescript
export interface AppState {
  // ... existing fields
  calendarMonth: number | null; // null = use current month
  calendarYear: number | null;  // null = use current year
}

interface AppContextValue extends AppState {
  // ... existing methods
  setCalendarMonth: (month: number) => void;
  setCalendarYear: (year: number) => void;
}
```

### Entry Date Grouping

```typescript
interface EntriesByDate {
  [dateKey: string]: Entry[]; // dateKey format: "YYYY-MM-DD"
}
```

### Calendar Date Info

```typescript
interface CalendarDate {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  entries: Entry[];
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Calendar Grid Completeness

*For any* month and year, the calendar grid should display complete weeks (35-42 date cells total), including padding dates from adjacent months that are visually distinguished from current month dates.

**Validates: Requirements 1.1, 1.5**

### Property 2: Weekday Headers Display

*For any* locale setting, the calendar should display exactly 7 weekday headers in the correct order for that locale.

**Validates: Requirements 1.2**

### Property 3: Month Year Heading Accuracy

*For any* selected month and year, the calendar heading should display the correct month name and year value.

**Validates: Requirements 1.3**

### Property 4: Today Highlighting

*For any* calendar view where the displayed month contains today's date, the date cell for today should have a distinct visual marker.

**Validates: Requirements 1.4**

### Property 5: Entry Indicator Presence

*For any* date with one or more journal entries, the corresponding date cell should display a visually distinct entry indicator.

**Validates: Requirements 2.1, 2.3**

### Property 6: Entry Count Display

*For any* date with multiple journal entries (N > 1), the entry indicator should display the count N.

**Validates: Requirements 2.2**

### Property 7: Month Navigation

*For any* displayed month, activating the previous or next month controls should change the displayed month to the adjacent month (previous or next respectively).

**Validates: Requirements 3.3, 3.4**

### Property 8: Current Month Navigation

*For any* displayed month, activating the current month control should navigate to the month containing today's date.

**Validates: Requirements 3.6**

### Property 9: Single Entry Date Click

*For any* date with exactly one journal entry, clicking that date cell should navigate to the viewer for that entry.

**Validates: Requirements 4.1**

### Property 10: Multiple Entry Date Click

*For any* date with multiple journal entries, clicking that date cell should display a modal or list showing all entries for that date.

**Validates: Requirements 4.2**

### Property 11: Empty Date Click

*For any* date with no journal entries, clicking that date cell should provide an option to create a new entry for that date.

**Validates: Requirements 4.3, 7.3**

### Property 12: Modal Entry Selection

*For any* entry selected from the multi-entry date modal, the application should navigate to the viewer for that specific entry.

**Validates: Requirements 4.4**

### Property 13: View Switching

*For any* current view state, activating the calendar view control should change the current view to 'calendar'.

**Validates: Requirements 5.3**

### Property 14: Active View Indication

*For any* view state where the current view is 'calendar', the calendar navigation control should display an active state indicator.

**Validates: Requirements 5.4**

### Property 15: Calendar State Persistence

*For any* selected month and year in calendar view, switching to another view and returning to calendar view should restore the previously selected month and year.

**Validates: Requirements 6.1, 6.2**

### Property 16: Initial Calendar State

*For any* fresh application load (no existing calendar state), the calendar view should display the current month and year by default.

**Validates: Requirements 6.3**

### Property 17: Empty Month Display

*For any* month with no journal entries, the calendar grid should display without any entry indicators on any date cells.

**Validates: Requirements 7.1**

### Property 18: Empty State Interactivity

*For any* month with no journal entries, all date cells should remain clickable and interactive.

**Validates: Requirements 7.2**

## Error Handling

### Entry Loading Errors

**Scenario**: StorageService fails to load entries

**Handling**:
- Display error message to user: "Failed to load journal entries"
- Show empty calendar grid with option to retry
- Log error to console for debugging
- Prevent navigation actions until entries are loaded

**Implementation**: Leverage existing error handling in useEntries hook

### Invalid Date Navigation

**Scenario**: User attempts to navigate to invalid month/year

**Handling**:
- Validate month (0-11) and year (reasonable range: 1900-2100)
- Clamp invalid values to valid range
- Log warning for debugging
- Display clamped month/year to user

**Implementation**: Add validation in navigation handler functions

### Missing Entry on Click

**Scenario**: User clicks date with entry indicator, but entry no longer exists

**Handling**:
- Check if entry exists before navigation
- If missing, show notification: "Entry no longer exists"
- Refresh calendar to remove stale indicator
- Remain on calendar view

**Implementation**: Add existence check in handleDateClick before navigation

### Modal Rendering Errors

**Scenario**: DateEntryModal fails to render

**Handling**:
- Catch rendering errors with error boundary
- Fall back to simple alert with entry titles
- Log error for debugging
- Allow user to continue using calendar

**Implementation**: Wrap DateEntryModal with React error boundary

### State Synchronization Issues

**Scenario**: Calendar state becomes out of sync with AppContext

**Handling**:
- Use useEffect to sync local state with context
- Reset to current month if state is invalid
- Log synchronization issues
- Provide "Reset Calendar" option in UI

**Implementation**: Add state validation in useEffect hooks

## Testing Strategy

### Dual Testing Approach

The calendar view feature will be validated using both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, component rendering, and user interactions
- **Property tests**: Verify universal properties across all inputs using randomized test data

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs and verify specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Library**: fast-check (already in project dependencies)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with comment referencing design property
- Tag format: `// Feature: calendar-view, Property {number}: {property_text}`

**Property Test Coverage**:

Each of the 18 correctness properties defined above will be implemented as a property-based test:

1. **Property 1 (Grid Completeness)**: Generate random month/year combinations, verify grid has 35-42 cells with correct padding
2. **Property 2 (Weekday Headers)**: Generate random locale settings, verify 7 headers in correct order
3. **Property 3 (Heading Accuracy)**: Generate random month/year, verify heading displays correct values
4. **Property 4 (Today Highlighting)**: Generate dates including today, verify today is highlighted
5. **Property 5 (Entry Indicator)**: Generate random entries and dates, verify indicators appear for dates with entries
6. **Property 6 (Entry Count)**: Generate random entry counts per date, verify counts display correctly
7. **Property 7 (Month Navigation)**: Generate random months, verify navigation moves to adjacent months
8. **Property 8 (Current Month)**: Generate random starting months, verify current month button returns to today
9. **Property 9 (Single Entry Click)**: Generate dates with single entries, verify navigation to viewer
10. **Property 10 (Multiple Entry Click)**: Generate dates with multiple entries, verify modal displays
11. **Property 11 (Empty Date Click)**: Generate dates with no entries, verify create option appears
12. **Property 12 (Modal Selection)**: Generate entry lists, verify selection navigates correctly
13. **Property 13 (View Switching)**: Generate random view states, verify switching to calendar works
14. **Property 14 (Active Indication)**: Generate view states, verify active state when on calendar
15. **Property 15 (State Persistence)**: Generate random month selections, verify persistence across view switches
16. **Property 16 (Initial State)**: Generate fresh app states, verify defaults to current month
17. **Property 17 (Empty Month)**: Generate months with no entries, verify no indicators
18. **Property 18 (Empty Interactivity)**: Generate empty months, verify cells remain clickable

### Unit Testing

**Framework**: Vitest + React Testing Library (existing setup)

**Unit Test Coverage**:

**Component Tests**:
- CalendarView: Rendering, prop handling, state management
- CalendarHeader: Navigation button clicks, display formatting
- CalendarGrid: Grid generation, date cell rendering
- DateCell: Click handling, visual states, accessibility
- DateEntryModal: Entry list display, selection, closing
- WeekdayHeaders: Locale handling, header order

**Integration Tests**:
- Calendar view integration with AppContext
- Navigation between calendar and other views
- Entry creation from calendar date click
- Entry viewing from calendar date click
- State persistence across view switches

**Edge Cases**:
- February in leap years vs non-leap years
- Month boundaries (Dec → Jan year transition)
- Empty entry list
- Single entry on date
- Many entries on single date (>10)
- Very old dates (year < 2000)
- Future dates
- Today's date in different months

**Accessibility Tests**:
- Keyboard navigation through date cells
- Screen reader announcements for dates with entries
- Focus management in modal
- ARIA labels and roles

**Error Scenarios**:
- Failed entry loading
- Missing entries on click
- Invalid month/year values
- Modal rendering failures

### Test File Organization

```
tests/
├── unit/
│   ├── CalendarView.test.tsx
│   ├── CalendarHeader.test.tsx
│   ├── CalendarGrid.test.tsx
│   ├── DateCell.test.tsx
│   ├── DateEntryModal.test.tsx
│   └── WeekdayHeaders.test.tsx
└── property/
    ├── calendar-grid.property.test.ts
    ├── calendar-navigation.property.test.ts
    ├── calendar-interactions.property.test.ts
    └── calendar-state.property.test.ts
```

### Performance Testing

While not part of automated tests, the following performance requirements should be manually validated:

- Calendar view initial render: < 200ms
- Month navigation: < 100ms
- Entry query for month: < 50ms (up to 1000 entries)
- View switching: < 100ms

Performance can be measured using React DevTools Profiler and browser performance APIs.

## Implementation Notes

### Date Utilities

Create utility functions for common date operations:

```typescript
// src/utils/dateUtils.ts
export function getMonthDays(month: number, year: number): number;
export function getFirstDayOfMonth(month: number, year: number): number;
export function isSameDay(date1: Date, date2: Date): boolean;
export function formatMonthYear(month: number, year: number): string;
export function getDateKey(date: Date): string; // Returns "YYYY-MM-DD"
export function groupEntriesByDate(entries: Entry[]): EntriesByDate;
```

### Performance Optimizations

1. **Memoization**: Use React.memo for DateCell components to prevent unnecessary re-renders
2. **Entry Filtering**: Pre-filter entries by month to reduce processing in CalendarGrid
3. **Date Calculations**: Cache calendar grid calculations when month/year unchanged
4. **Virtual Scrolling**: Not needed for single month view, but consider for year view (future enhancement)

### Accessibility Considerations

1. **Keyboard Navigation**: 
   - Arrow keys to navigate between date cells
   - Enter/Space to activate date cell
   - Escape to close modal
   - Tab order: header controls → grid → modal

2. **Screen Reader Support**:
   - ARIA labels for date cells: "January 15, 2024, 2 entries"
   - ARIA live region for month changes
   - Role="grid" for calendar grid
   - Role="gridcell" for date cells

3. **Focus Management**:
   - Maintain focus on date cell after month navigation
   - Move focus to modal when opened
   - Return focus to date cell when modal closed

### Responsive Design

**Desktop (> 768px)**:
- Full calendar grid with comfortable spacing
- Modal centered on screen
- Navigation controls in header

**Tablet (481-768px)**:
- Slightly condensed grid
- Modal takes 80% of screen width
- Touch-friendly button sizes

**Mobile (≤ 480px)**:
- Compact grid with smaller date cells
- Modal takes full screen width
- Larger touch targets for navigation
- Consider vertical scrolling for entry list

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (supported by Vite build)
- CSS Grid for calendar layout
- Flexbox for component layouts
- No IE11 support required

### Future Enhancements

Potential features for future iterations:

1. **Year View**: Display all 12 months in a year
2. **Week View**: Display a single week with entry details
3. **Entry Preview**: Hover to see entry preview tooltip
4. **Drag and Drop**: Drag entries to different dates
5. **Multi-Select**: Select multiple dates for batch operations
6. **Calendar Export**: Export calendar view as image or PDF
7. **Custom Week Start**: User preference for week start day
8. **Entry Density Heatmap**: Color intensity based on entry count
9. **Mood Calendar**: Color dates by mood of entries
10. **Search Integration**: Highlight dates matching search query
