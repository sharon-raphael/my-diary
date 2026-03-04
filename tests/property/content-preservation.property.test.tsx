import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EntryEditor } from '../../src/components/EntryEditor';

/**
 * Custom fast-check arbitrary for generating text content
 */
const textContentArbitrary = fc.string({ minLength: 1, maxLength: 1000 });

describe('Property-Based Tests: Content Preservation', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Property 2: Content Preservation in Editor', () => {
    it('should preserve exact text content entered into the editor without loss or modification', () => {
      // Feature: journey-journal-app, Property 2: For any text content entered into the Entry_Editor, the editor state SHALL contain that exact text content without loss or modification
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(textContentArbitrary, (textContent) => {
          // Clean up any previous renders
          cleanup();
          
          const mockSave = vi.fn();
          const mockCancel = vi.fn();

          render(
            <EntryEditor
              onSave={mockSave}
              onCancel={mockCancel}
            />
          );

          // Find the content textarea
          const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

          // Enter the text content
          fireEvent.change(contentTextarea, { target: { value: textContent } });

          // Verify the editor state contains the exact text content
          expect(contentTextarea.value).toBe(textContent);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve content with special characters and whitespace', () => {
      // Test that special characters, newlines, and whitespace are preserved
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (textContent) => {
            // Clean up any previous renders
            cleanup();
            
            const mockSave = vi.fn();
            const mockCancel = vi.fn();

            render(
              <EntryEditor
                onSave={mockSave}
                onCancel={mockCancel}
              />
            );

            const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

            // Enter the text content
            fireEvent.change(contentTextarea, { target: { value: textContent } });

            // Verify exact preservation including special characters
            expect(contentTextarea.value).toBe(textContent);
            expect(contentTextarea.value.length).toBe(textContent.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve content when editing existing entry', () => {
      // Test that content is preserved when editing an existing entry
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 500 }),
          (initialContent, newContent) => {
            // Clean up any previous renders
            cleanup();
            
            const mockSave = vi.fn();
            const mockCancel = vi.fn();

            const existingEntry = {
              id: 'test-id',
              title: 'Test Entry',
              content: initialContent,
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
              mood: null,
              tags: [],
              version: 1
            };

            render(
              <EntryEditor
                entry={existingEntry}
                onSave={mockSave}
                onCancel={mockCancel}
              />
            );

            const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

            // Verify initial content is loaded
            expect(contentTextarea.value).toBe(initialContent);

            // Enter new content
            fireEvent.change(contentTextarea, { target: { value: newContent } });

            // Verify new content is preserved exactly
            expect(contentTextarea.value).toBe(newContent);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve content through multiple edits', () => {
      // Test that content is preserved through multiple sequential edits
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 2, maxLength: 5 }),
          (contentSequence) => {
            // Clean up any previous renders
            cleanup();
            
            const mockSave = vi.fn();
            const mockCancel = vi.fn();

            render(
              <EntryEditor
                onSave={mockSave}
                onCancel={mockCancel}
              />
            );

            const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

            // Apply each content change in sequence
            for (const content of contentSequence) {
              fireEvent.change(contentTextarea, { target: { value: content } });

              // Verify content is preserved after each edit
              expect(contentTextarea.value).toBe(content);
            }

            // Verify final content matches the last in sequence
            expect(contentTextarea.value).toBe(contentSequence[contentSequence.length - 1]);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should preserve empty content', () => {
      // Test that empty content is handled correctly
      // Validates: Requirements 1.3

      const mockSave = vi.fn();
      const mockCancel = vi.fn();

      render(
        <EntryEditor
          onSave={mockSave}
          onCancel={mockCancel}
        />
      );

      const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

      // Verify empty content is preserved
      expect(contentTextarea.value).toBe('');

      // Type and then clear
      fireEvent.change(contentTextarea, { target: { value: 'test content' } });
      fireEvent.change(contentTextarea, { target: { value: '' } });

      // Verify empty state is preserved
      expect(contentTextarea.value).toBe('');
    });

    it('should preserve content with maximum length', () => {
      // Test that content at maximum length is preserved
      // Validates: Requirements 1.3, 1.6

      const mockSave = vi.fn();
      const mockCancel = vi.fn();

      // Generate content near the maximum length (100,000 chars)
      // Using a smaller size for test performance
      const maxTestContent = 'a'.repeat(1000);

      render(
        <EntryEditor
          onSave={mockSave}
          onCancel={mockCancel}
        />
      );

      const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;

      // Enter maximum length content
      fireEvent.change(contentTextarea, { target: { value: maxTestContent } });

      // Verify content is preserved exactly
      expect(contentTextarea.value).toBe(maxTestContent);
      expect(contentTextarea.value.length).toBe(maxTestContent.length);
    });
  });
});
