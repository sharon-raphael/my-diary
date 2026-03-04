# Implementation Plan: Journey Journal App

## Overview

This implementation plan breaks down the Journey Journal App into discrete coding tasks following the 7 development phases outlined in the design document. Each task builds incrementally on previous work, with property-based tests integrated throughout to validate correctness properties. The application will be built using React 18+ with TypeScript, Vite as the build tool, and Draft.js for rich text editing.

## Tasks

- [ ] 1. Phase 1: Core Infrastructure Setup
  - [x] 1.1 Initialize React project with TypeScript and Vite
    - Create new Vite project with React-TypeScript template
    - Configure TypeScript with strict mode enabled
    - Set up project structure (src/components, src/hooks, src/services, src/types)
    - Install core dependencies: react, react-dom, typescript, vite
    - _Requirements: 8.1, 14.1_

  - [x] 1.2 Define TypeScript interfaces and data models
    - Create Entry interface with all fields (id, title, content, timestamps, mood, tags, version)
    - Create Mood type and MoodOption interface
    - Create SortOrder type
    - Create UserPreferences interface
    - Create StorageContainer and StoredEntry interfaces
    - Create error types (StorageError, ValidationError)
    - _Requirements: 1.2, 2.5, 6.1, 6.4, 7.5, 8.2, 9.1_

  - [x] 1.3 Implement StorageService with basic save/load functionality
    - Create StorageAdapter class with getItem/setItem methods and error handling
    - Implement saveEntry method with JSON serialization
    - Implement loadEntries method with JSON parsing and error handling
    - Implement deleteEntry method
    - Implement savePreferences and loadPreferences methods
    - Handle QuotaExceededError and corrupted data scenarios
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

  - [x] 1.4 Implement ValidationService
    - Create validateEntry function with type guards
    - Create validateEntryArray function
    - Create sanitizeContent function for XSS prevention
    - Create validateImportData function with detailed error reporting
    - Implement content length validation (100,000 chars for content, 200 for title)
    - _Requirements: 1.6, 8.6, 12.3, 13.2_

  - [x] 1.5 Write property test for serialization round-trip integrity
    - **Property 30: Serialization Round-Trip Integrity**
    - **Validates: Requirements 14.3, 14.4, 14.5, 4.6, 6.4, 8.1**
    - Set up fast-check with custom entry generator
    - Test that serializing and parsing preserves all entry fields
    - Verify content, metadata, timestamps, and formatting are identical

- [ ] 2. Phase 2: Basic Entry Management
  - [x] 2.1 Create App component with context provider
    - Set up React Context for global state (entries, currentView, selectedEntryId, searchQuery, sortOrder)
    - Implement AppState interface
    - Create context provider component
    - Set up basic routing logic between list/editor/viewer views
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Implement useEntries custom hook
    - Create hook with entries state management
    - Implement createEntry function with UUID generation and timestamp capture
    - Implement updateEntry function preserving createdAt timestamp
    - Implement deleteEntry function
    - Implement getEntry function
    - Integrate with StorageService for persistence
    - Handle loading and error states
    - _Requirements: 1.2, 1.4, 1.5, 2.3, 2.4, 2.5, 3.2, 3.3, 8.2, 9.1_

  - [x] 2.3 Write property tests for entry CRUD operations
    - **Property 1: Entry Creation Timestamp**
    - **Validates: Requirements 1.2, 9.1**
    - **Property 4: Edit Preserves Creation Timestamp**
    - **Validates: Requirements 2.3**
    - **Property 5: Last Modified Timestamp Update**
    - **Validates: Requirements 2.5**
    - **Property 6: Deletion Removes Entry**
    - **Validates: Requirements 3.2, 3.3**
    - **Property 19: Unique Entry Identifiers**
    - **Validates: Requirements 8.2**

  - [x] 2.4 Implement EntryList component
    - Create component displaying all entries
    - Display entry title, creation date, and mood indicator
    - Implement entry selection handler
    - Implement delete button with confirmation dialog
    - Format dates in human-readable format
    - Add create entry button
    - _Requirements: 1.5, 2.1, 3.1, 6.6, 9.2, 13.4_

  - [x] 2.5 Write property tests for entry list consistency
    - **Property 3: Entry List Consistency**
    - **Validates: Requirements 1.5, 8.4, 12.6**
    - **Property 7: Deletion Cancellation Preserves Entry**
    - **Validates: Requirements 3.4**
    - **Property 20: Entry Load Completeness**
    - **Validates: Requirements 8.3**

  - [x] 2.6 Implement EntryEditor component with basic text input
    - Create component with title input field and basic textarea
    - Implement save and cancel handlers
    - Handle new entry creation vs editing existing entry
    - Capture timestamps on save
    - Track dirty state for unsaved changes warning
    - _Requirements: 1.1, 1.3, 1.4, 2.2, 13.1_

  - [x] 2.7 Write property test for content preservation
    - **Property 2: Content Preservation in Editor**
    - **Validates: Requirements 1.3**

  - [x] 2.7 Implement EntryViewer component
    - Create read-only display component
    - Display title, content, creation date, and last modified date
    - Add edit, delete, and back buttons
    - Display metadata (mood and tags)
    - _Requirements: 2.1, 6.5, 9.3_

  - [x] 2.9 Write property test for metadata display
    - **Property 14: Metadata Display Completeness**
    - **Validates: Requirements 6.5**
    - **Property 22: Dual Timestamp Display**
    - **Validates: Requirements 9.3**

- [x] 3. Checkpoint - Verify basic entry management
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Phase 3: Rich Text Editing
  - [x] 4.1 Install and configure Draft.js
    - Install draft-js and @types/draft-js
    - Install draft-js-export-html and draft-js-import-html for HTML conversion
    - Set up Draft.js CSS imports
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Create RichTextEditor component
    - Wrap Draft.js Editor component
    - Implement EditorState management
    - Create formatting toolbar with buttons (bold, italic, headings, lists)
    - Implement keyboard shortcuts for formatting
    - Add character count display
    - Enforce 100,000 character limit
    - _Requirements: 1.6, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement rich text serialization functions
    - Create serializeContent function (EditorState to JSON string)
    - Create deserializeContent function (JSON string to EditorState)
    - Use Draft.js convertToRaw and convertFromRaw
    - Handle parsing errors gracefully
    - _Requirements: 4.6, 8.1, 14.1, 14.2_

  - [x] 4.4 Integrate RichTextEditor into EntryEditor
    - Replace basic textarea with RichTextEditor component
    - Update save handler to serialize rich text content
    - Update load handler to deserialize rich text content
    - _Requirements: 1.3, 4.6_

  - [x] 4.5 Update EntryViewer to render rich text
    - Parse stored rich text content
    - Render formatted content with proper HTML elements
    - Preserve all formatting (bold, italic, lists, headings)
    - _Requirements: 4.7_

  - [x] 4.6 Write property tests for rich text formatting
    - **Property 8: Rich Text Formatting Support**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
    - **Property 9: Formatting Display Consistency**
    - **Validates: Requirements 4.7**
    - Create custom generator for rich text content with various formatting
    - Test that formatting is preserved through save/load cycle

- [ ] 5. Phase 4: Search and Sort
  - [x] 5.1 Implement useSearch custom hook
    - Create hook with query state
    - Implement searchEntries function with case-insensitive matching
    - Search across title and content fields
    - Return filtered entries
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 5.2 Write property tests for search functionality
    - **Property 10: Search Result Matching**
    - **Validates: Requirements 5.1, 5.2**
    - **Property 11: Case-Insensitive Search**
    - **Validates: Requirements 5.5**

  - [x] 5.3 Create SearchBar component
    - Create search input field with placeholder
    - Implement real-time query updates with debouncing
    - Clear search button
    - _Requirements: 5.3, 5.4_

  - [x] 5.4 Implement useSort custom hook
    - Create hook with sortOrder state
    - Implement sortEntries function for all sort orders
    - Support createdAt-desc (default), createdAt-asc, modifiedAt-desc, modifiedAt-asc
    - Persist sort preference to Local Storage
    - Load sort preference on app initialization
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 5.5 Write property tests for sorting functionality
    - **Property 16: Ascending Date Sort Order**
    - **Validates: Requirements 7.2**
    - **Property 17: Modified Date Sort Order**
    - **Validates: Requirements 7.3**
    - **Property 18: Sort Preference Persistence**
    - **Validates: Requirements 7.5**

  - [x] 5.6 Add sort controls to EntryList
    - Create sort dropdown or buttons
    - Update EntryList to use sorted entries
    - Implement immediate UI update on sort change
    - _Requirements: 7.4_

  - [x] 5.7 Integrate SearchBar into App navigation
    - Add SearchBar to app header
    - Connect search query to entry filtering
    - Display filtered and sorted entries in EntryList
    - _Requirements: 5.3, 5.4_

- [ ] 6. Phase 5: Metadata and Enhancement
  - [x] 6.1 Create MoodSelector component
    - Define mood options with labels, emojis, and colors
    - Create mood selection UI (dropdown or button grid)
    - Allow clearing mood selection
    - _Requirements: 6.1_

  - [x] 6.2 Create TagInput component
    - Create input field for adding tags
    - Display existing tags as removable chips
    - Support creating new tags
    - Support adding multiple tags
    - _Requirements: 6.2, 6.3_

  - [x] 6.3 Write property tests for metadata
    - **Property 12: Multiple Tags Support**
    - **Validates: Requirements 6.2**
    - **Property 13: New Tag Creation**
    - **Validates: Requirements 6.3**
    - **Property 15: Mood Indicator Display**
    - **Validates: Requirements 6.6**

  - [x] 6.4 Integrate MoodSelector and TagInput into EntryEditor
    - Add MoodSelector below title field
    - Add TagInput below mood selector
    - Update save handler to include mood and tags
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.5 Update EntryViewer to display metadata
    - Display mood with emoji and label
    - Display tags as styled chips
    - Show metadata section only if mood or tags exist
    - _Requirements: 6.5_

  - [x] 6.6 Update EntryList to show mood indicators
    - Display mood emoji next to entry title
    - Add visual indicator for entries with tags
    - _Requirements: 6.6_

  - [x] 6.7 Implement auto-title generation
    - Create generateTitle function
    - Extract first line from content (strip HTML/formatting)
    - Truncate to 50 characters if needed
    - Use "Untitled Entry" as fallback
    - Apply auto-title when user saves without title
    - _Requirements: 13.3_

  - [x] 6.8 Write property test for auto-title generation
    - **Property 29: Auto-Title Generation**
    - **Validates: Requirements 13.3**

- [x] 7. Checkpoint - Verify search, sort, and metadata features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Phase 6: Import/Export
  - [x] 8.1 Implement export functionality in StorageService
    - Create exportData method returning JSON string
    - Include all entries with complete data
    - Ensure valid JSON format
    - _Requirements: 11.1, 11.2, 11.5_

  - [x] 8.2 Create export UI in Navigation component
    - Add export button to app header
    - Implement file download trigger
    - Generate filename with current date (e.g., "journal-export-2024-01-15.json")
    - _Requirements: 11.3, 11.4_

  - [x] 8.3 Write property tests for export
    - **Property 24: Export Completeness and Validity**
    - **Validates: Requirements 11.1, 11.2, 11.5**
    - **Property 25: Export Filename Convention**
    - **Validates: Requirements 11.4**

  - [x] 8.4 Implement import functionality in StorageService
    - Create importData method accepting JSON string
    - Parse and validate import data using ValidationService
    - Implement deduplication logic (check entry IDs)
    - Merge imported entries with existing entries
    - Return validation results with error details
    - _Requirements: 12.2, 12.4, 12.5_

  - [x] 8.5 Create import UI in Navigation component
    - Add import button to app header
    - Create file upload interface
    - Handle file selection and reading
    - Display success/error messages
    - Update EntryList after successful import
    - _Requirements: 12.1, 12.3, 12.6_

  - [x] 8.6 Write property tests for import
    - **Property 26: Import Parsing**
    - **Validates: Requirements 12.2**
    - **Property 27: Import Merge**
    - **Validates: Requirements 12.4**
    - **Property 28: Import Deduplication**
    - **Validates: Requirements 12.5**

- [ ] 9. Phase 7: Polish and Responsive Design
  - [x] 9.1 Implement responsive layouts with CSS
    - Create mobile layout for screens < 768px
    - Create desktop layout for screens >= 768px
    - Use CSS media queries for responsive breakpoints
    - Implement single-column layout for mobile EntryList
    - Ensure touch-friendly controls on mobile
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 9.2 Implement date grouping in EntryList
    - Group entries by calendar date
    - Display date headers between groups
    - Format dates according to user locale
    - _Requirements: 9.4, 9.5_

  - [x] 9.3 Write property test for date grouping
    - **Property 23: Date Grouping**
    - **Validates: Requirements 9.5**
    - **Property 21: Date Format Display**
    - **Validates: Requirements 9.2**

  - [x] 9.4 Add comprehensive error handling and user feedback
    - Display error messages for storage quota exceeded
    - Display error messages for corrupted data
    - Display error messages for invalid imports
    - Add loading states for async operations
    - Add success notifications for save/delete/import/export
    - Implement unsaved changes warning
    - _Requirements: 8.5, 8.6, 12.3_

  - [x] 9.5 Implement accessibility features
    - Add ARIA labels and roles to all interactive elements
    - Ensure full keyboard navigation support
    - Add visible focus indicators
    - Ensure WCAG AA color contrast compliance
    - Use semantic HTML elements
    - Test with screen reader
    - _Requirements: All (accessibility is cross-cutting)_

  - [x] 9.6 Add performance optimizations
    - Implement debouncing for search input (300ms delay)
    - Use React.memo for EntryCard components
    - Use useMemo for expensive computations (sorting, filtering)
    - Consider virtual scrolling for large entry lists (if needed)
    - _Requirements: 5.3 (real-time search performance)_

  - [x] 9.7 Write integration tests for critical user flows
    - Test complete entry lifecycle (create → edit → view → delete)
    - Test search and filter with various queries
    - Test import/export round-trip
    - Test storage persistence across app reloads

- [x] 10. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations
- All property tests include comments with property number and validated requirements
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows React best practices with functional components and hooks
- TypeScript strict mode ensures type safety throughout the application
- All data remains local in the browser for privacy and offline functionality
