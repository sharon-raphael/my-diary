import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Entry, Mood } from '../../src/types/entry';

/**
 * Custom fast-check arbitrary for generating valid Entry objects
 */
const entryArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ maxLength: 200 }),
  content: fc.string({ maxLength: 100000 }),
  createdAt: fc.integer({ min: 0, max: Date.now() }),
  lastModifiedAt: fc.integer({ min: 0, max: Date.now() }),
  mood: fc.option(
    fc.constantFrom<Mood>(
      'happy',
      'sad',
      'excited',
      'anxious',
      'calm',
      'grateful',
      'reflective',
      'energetic'
    ),
    { nil: null }
  ),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
  version: fc.constant(1)
});

describe('Property-Based Tests: Serialization', () => {
  describe('Property 30: Serialization Round-Trip Integrity', () => {
    it('should preserve all entry fields through JSON serialization and parsing', () => {
      // Feature: journey-journal-app, Property 30: For any valid entry object, serializing to JSON and then parsing back SHALL produce an entry object with identical content, metadata, timestamps, and formatting
      // Validates: Requirements 14.3, 14.4, 14.5, 4.6, 6.4, 8.1
      
      fc.assert(
        fc.property(entryArbitrary, (entry: Entry) => {
          // Serialize the entry to JSON
          const serialized = JSON.stringify(entry);
          
          // Parse it back
          const deserialized = JSON.parse(serialized);
          
          // Verify complete equality
          expect(deserialized).toEqual(entry);
          
          // Verify specific fields are preserved
          expect(deserialized.id).toBe(entry.id);
          expect(deserialized.title).toBe(entry.title);
          expect(deserialized.content).toBe(entry.content);
          expect(deserialized.createdAt).toBe(entry.createdAt);
          expect(deserialized.lastModifiedAt).toBe(entry.lastModifiedAt);
          expect(deserialized.mood).toBe(entry.mood);
          expect(deserialized.tags).toEqual(entry.tags);
          expect(deserialized.version).toBe(entry.version);
        }),
        { numRuns: 100, verbose: true }
      );
    });

    it('should preserve content with special characters through serialization', () => {
      // Test that special characters in content are preserved
      // Validates: Requirements 14.3, 14.4, 8.1
      
      const specialContentArbitrary = fc.record({
        id: fc.uuid(),
        title: fc.string({ maxLength: 200 }),
        content: fc.oneof(
          fc.string({ maxLength: 1000 }),
          fc.constant('<p><strong>Bold</strong> and <em>italic</em></p>'),
          fc.constant('Line 1\nLine 2\nLine 3'),
          fc.constant('Quotes: "double" and \'single\''),
          fc.constant('Special: & < > " \' / \\'),
          fc.constant('Unicode: 你好 🎉 café')
        ),
        createdAt: fc.integer({ min: 0, max: Date.now() }),
        lastModifiedAt: fc.integer({ min: 0, max: Date.now() }),
        mood: fc.option(
          fc.constantFrom<Mood>(
            'happy',
            'sad',
            'excited',
            'anxious',
            'calm',
            'grateful',
            'reflective',
            'energetic'
          ),
          { nil: null }
        ),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
        version: fc.constant(1)
      });

      fc.assert(
        fc.property(specialContentArbitrary, (entry: Entry) => {
          const serialized = JSON.stringify(entry);
          const deserialized = JSON.parse(serialized);
          
          expect(deserialized.content).toBe(entry.content);
          expect(deserialized).toEqual(entry);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve metadata (mood and tags) through serialization', () => {
      // Test that metadata is preserved correctly
      // Validates: Requirements 14.5, 6.4
      
      fc.assert(
        fc.property(entryArbitrary, (entry: Entry) => {
          const serialized = JSON.stringify(entry);
          const deserialized = JSON.parse(serialized);
          
          // Verify mood is preserved (including null)
          expect(deserialized.mood).toBe(entry.mood);
          
          // Verify tags array is preserved
          expect(deserialized.tags).toEqual(entry.tags);
          expect(deserialized.tags.length).toBe(entry.tags.length);
          
          // Verify each tag is preserved
          entry.tags.forEach((tag, index) => {
            expect(deserialized.tags[index]).toBe(tag);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve timestamps with exact precision through serialization', () => {
      // Test that timestamps maintain exact values
      // Validates: Requirements 14.3, 14.4
      
      fc.assert(
        fc.property(entryArbitrary, (entry: Entry) => {
          const serialized = JSON.stringify(entry);
          const deserialized = JSON.parse(serialized);
          
          // Timestamps must be exactly equal (no precision loss)
          expect(deserialized.createdAt).toBe(entry.createdAt);
          expect(deserialized.lastModifiedAt).toBe(entry.lastModifiedAt);
          
          // Verify they are still numbers
          expect(typeof deserialized.createdAt).toBe('number');
          expect(typeof deserialized.lastModifiedAt).toBe('number');
        }),
        { numRuns: 100 }
      );
    });

    it('should handle entries with empty strings and empty arrays', () => {
      // Test edge cases with empty values
      // Validates: Requirements 14.3, 14.4, 14.5
      
      const edgeCaseArbitrary = fc.record({
        id: fc.uuid(),
        title: fc.oneof(fc.constant(''), fc.string({ maxLength: 200 })),
        content: fc.oneof(fc.constant(''), fc.string({ maxLength: 100000 })),
        createdAt: fc.integer({ min: 0, max: Date.now() }),
        lastModifiedAt: fc.integer({ min: 0, max: Date.now() }),
        mood: fc.option(
          fc.constantFrom<Mood>(
            'happy',
            'sad',
            'excited',
            'anxious',
            'calm',
            'grateful',
            'reflective',
            'energetic'
          ),
          { nil: null }
        ),
        tags: fc.oneof(fc.constant([]), fc.array(fc.string({ minLength: 1, maxLength: 50 }))),
        version: fc.constant(1)
      });

      fc.assert(
        fc.property(edgeCaseArbitrary, (entry: Entry) => {
          const serialized = JSON.stringify(entry);
          const deserialized = JSON.parse(serialized);
          
          expect(deserialized).toEqual(entry);
          expect(deserialized.title).toBe(entry.title);
          expect(deserialized.content).toBe(entry.content);
          expect(deserialized.tags).toEqual(entry.tags);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve entries at maximum field lengths', () => {
      // Test entries with maximum allowed field lengths
      // Validates: Requirements 14.3, 14.4, 4.6
      
      const maxLengthArbitrary = fc.record({
        id: fc.uuid(),
        title: fc.string({ minLength: 200, maxLength: 200 }), // Exactly 200 chars
        content: fc.string({ minLength: 99000, maxLength: 100000 }), // Near or at max
        createdAt: fc.integer({ min: 0, max: Date.now() }),
        lastModifiedAt: fc.integer({ min: 0, max: Date.now() }),
        mood: fc.option(
          fc.constantFrom<Mood>(
            'happy',
            'sad',
            'excited',
            'anxious',
            'calm',
            'grateful',
            'reflective',
            'energetic'
          ),
          { nil: null }
        ),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 5, maxLength: 10 }),
        version: fc.constant(1)
      });

      fc.assert(
        fc.property(maxLengthArbitrary, (entry: Entry) => {
          const serialized = JSON.stringify(entry);
          const deserialized = JSON.parse(serialized);
          
          expect(deserialized).toEqual(entry);
          expect(deserialized.title.length).toBe(entry.title.length);
          expect(deserialized.content.length).toBe(entry.content.length);
        }),
        { numRuns: 20 } // Fewer runs due to large content size
      );
    });
  });
});
