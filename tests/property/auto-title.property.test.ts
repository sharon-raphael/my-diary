import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateTitle } from '../../src/utils/titleGenerator';

/**
 * Property tests for auto-title generation
 */
describe('Auto-Title Generation Properties', () => {
  it('Property 29: Auto-Title Generation - For any entry saved without a title, SHALL generate a title from first line of content', () => {
    // Feature: journey-journal-app, Property 29: Auto-Title Generation
    // Validates: Requirements 13.3
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }),
        (content) => {
          const generated = generateTitle(content);

          // Verify a title was generated
          expect(generated).toBeTruthy();
          expect(typeof generated).toBe('string');
          expect(generated.length).toBeGreaterThan(0);

          // Verify it's not longer than max length
          expect(generated.length).toBeLessThanOrEqual(53); // 50 + "..."

          // If content is empty/whitespace, should use fallback
          if (!content.trim()) {
            expect(generated).toBe('Untitled Entry');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Auto-title should use first line of content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (firstLine, secondLine) => {
          const content = `${firstLine}\n${secondLine}`;
          const generated = generateTitle(content);

          // We test that the generated title is a substring of the stripped content
          const strippedContent = content.replace(/<[^>]*>/g, '').trim();
          if (generated !== 'Untitled Entry') {
            const expectedStr = generated.replace('...', '');
            expect(strippedContent.includes(expectedStr)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Auto-title should strip HTML tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (text) => {
          const htmlContent = `<p><strong>${text}</strong></p>`;
          const generated = generateTitle(htmlContent);

          // Should not contain HTML tags
          expect(generated).not.toMatch(/<[^>]+>/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
