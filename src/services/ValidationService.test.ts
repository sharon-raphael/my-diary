import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationService } from './ValidationService';
import type { Entry } from '../types/entry';
import { ValidationError } from '../types/errors';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateEntry', () => {
    it('should validate a valid entry', () => {
      const entry: Entry = {
        id: 'test-id-1',
        title: 'Test Entry',
        content: 'This is test content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'happy',
        tags: ['test', 'example'],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(true);
    });

    it('should validate an entry with null mood', () => {
      const entry: Entry = {
        id: 'test-id-1',
        title: 'Test Entry',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(true);
    });

    it('should validate an entry with empty tags', () => {
      const entry: Entry = {
        id: 'test-id-1',
        title: 'Test Entry',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(true);
    });

    it('should reject entry with missing id', () => {
      const entry = {
        title: 'Test Entry',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with empty id', () => {
      const entry = {
        id: '',
        title: 'Test Entry',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with invalid title type', () => {
      const entry = {
        id: 'test-id',
        title: 123,
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with invalid content type', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: null,
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with invalid createdAt', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: 'not-a-number',
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with negative timestamp', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: -1,
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with invalid mood', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'invalid-mood',
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with non-array tags', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: 'not-an-array',
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with empty string in tags', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: ['valid', '', 'another'],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with invalid version', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 0
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should reject entry with content exceeding max length', () => {
      const entry = {
        id: 'test-id',
        title: 'Title',
        content: 'a'.repeat(100001),
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should accept entry with content at max length', () => {
      const entry: Entry = {
        id: 'test-id',
        title: 'Title',
        content: 'a'.repeat(100000),
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(true);
    });

    it('should reject entry with title exceeding max length', () => {
      const entry = {
        id: 'test-id',
        title: 'a'.repeat(201),
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(false);
    });

    it('should accept entry with title at max length', () => {
      const entry: Entry = {
        id: 'test-id',
        title: 'a'.repeat(200),
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      expect(validationService.validateEntry(entry)).toBe(true);
    });

    it('should reject null', () => {
      expect(validationService.validateEntry(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(validationService.validateEntry(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(validationService.validateEntry('string')).toBe(false);
      expect(validationService.validateEntry(123)).toBe(false);
      expect(validationService.validateEntry(true)).toBe(false);
    });
  });

  describe('validateEntryArray', () => {
    it('should validate an array of valid entries', () => {
      const entries: Entry[] = [
        {
          id: 'test-id-1',
          title: 'Entry 1',
          content: 'Content 1',
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          mood: 'happy',
          tags: ['tag1'],
          version: 1
        },
        {
          id: 'test-id-2',
          title: 'Entry 2',
          content: 'Content 2',
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          mood: null,
          tags: [],
          version: 1
        }
      ];

      expect(validationService.validateEntryArray(entries)).toBe(true);
    });

    it('should validate an empty array', () => {
      expect(validationService.validateEntryArray([])).toBe(true);
    });

    it('should reject array with one invalid entry', () => {
      const entries = [
        {
          id: 'test-id-1',
          title: 'Entry 1',
          content: 'Content 1',
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          mood: 'happy',
          tags: ['tag1'],
          version: 1
        },
        {
          id: 'test-id-2',
          title: 'Entry 2',
          // missing content
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          mood: null,
          tags: [],
          version: 1
        }
      ];

      expect(validationService.validateEntryArray(entries)).toBe(false);
    });

    it('should reject non-array', () => {
      expect(validationService.validateEntryArray('not-an-array')).toBe(false);
      expect(validationService.validateEntryArray({})).toBe(false);
      expect(validationService.validateEntryArray(null)).toBe(false);
    });
  });

  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const content = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Hello</p>');
      expect(sanitized).toContain('<p>World</p>');
    });

    it('should remove iframe tags', () => {
      const content = '<p>Content</p><iframe src="evil.com"></iframe>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).toContain('<p>Content</p>');
    });

    it('should remove event handlers', () => {
      const content = '<div onclick="alert(\'xss\')">Click me</div>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('Click me');
    });

    it('should remove javascript: protocol', () => {
      const content = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove data:text/html protocol', () => {
      const content = '<a href="data:text/html,<script>alert(\'xss\')</script>">Link</a>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('data:text/html');
    });

    it('should preserve safe HTML', () => {
      const content = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).toBe(content);
    });

    it('should handle empty string', () => {
      expect(validationService.sanitizeContent('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(validationService.sanitizeContent(null as any)).toBe('');
      expect(validationService.sanitizeContent(undefined as any)).toBe('');
      expect(validationService.sanitizeContent(123 as any)).toBe('');
    });

    it('should remove multiple dangerous tags', () => {
      const content = '<p>Safe</p><script>bad()</script><iframe></iframe><object></object>';
      const sanitized = validationService.sanitizeContent(content);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('<object>');
      expect(sanitized).toContain('<p>Safe</p>');
    });
  });

  describe('validateImportData', () => {
    it('should validate valid import data', () => {
      const data = {
        entries: [
          {
            id: 'test-id-1',
            title: 'Entry 1',
            content: 'Content 1',
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            mood: 'happy',
            tags: ['tag1'],
            version: 1
          }
        ],
        version: 1,
        lastUpdated: Date.now()
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validEntries).toHaveLength(1);
      expect(result.invalidCount).toBe(0);
    });

    it('should sanitize content in valid entries', () => {
      const data = {
        entries: [
          {
            id: 'test-id-1',
            title: 'Entry 1',
            content: '<p>Safe</p><script>alert("xss")</script>',
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            mood: null,
            tags: [],
            version: 1
          }
        ]
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(true);
      expect(result.validEntries[0].content).not.toContain('<script>');
      expect(result.validEntries[0].content).toContain('<p>Safe</p>');
    });

    it('should handle mixed valid and invalid entries', () => {
      const data = {
        entries: [
          {
            id: 'test-id-1',
            title: 'Valid Entry',
            content: 'Content',
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            mood: null,
            tags: [],
            version: 1
          },
          {
            id: 'test-id-2',
            title: 'Invalid Entry',
            // missing content
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            mood: null,
            tags: [],
            version: 1
          },
          {
            id: 'test-id-3',
            title: 'Another Valid',
            content: 'More content',
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            mood: 'calm',
            tags: ['test'],
            version: 1
          }
        ]
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(true);
      expect(result.validEntries).toHaveLength(2);
      expect(result.invalidCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('index 1');
    });

    it('should reject non-object data', () => {
      const result = validationService.validateImportData('not-an-object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Import data must be an object');
      expect(result.validEntries).toHaveLength(0);
    });

    it('should reject data without entries field', () => {
      const data = {
        version: 1,
        lastUpdated: Date.now()
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Import data must contain an "entries" field');
    });

    it('should reject data with non-array entries', () => {
      const data = {
        entries: 'not-an-array'
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('The "entries" field must be an array');
    });

    it('should reject data with empty entries array', () => {
      const data = {
        entries: []
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Import data contains an empty entries array');
    });

    it('should reject data with all invalid entries', () => {
      const data = {
        entries: [
          { id: 'bad-1' }, // missing required fields
          { id: 'bad-2' }  // missing required fields
        ]
      };

      const result = validationService.validateImportData(data);

      expect(result.valid).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.invalidCount).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateContentLength', () => {
    it('should not throw for valid content length', () => {
      const content = 'a'.repeat(50000);
      expect(() => validationService.validateContentLength(content)).not.toThrow();
    });

    it('should not throw for content at max length', () => {
      const content = 'a'.repeat(100000);
      expect(() => validationService.validateContentLength(content)).not.toThrow();
    });

    it('should throw ValidationError for content exceeding max length', () => {
      const content = 'a'.repeat(100001);
      
      expect(() => validationService.validateContentLength(content)).toThrow(ValidationError);
      
      try {
        validationService.validateContentLength(content);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('content');
        expect((error as ValidationError).message).toContain('100000');
      }
    });
  });

  describe('validateTitleLength', () => {
    it('should not throw for valid title length', () => {
      const title = 'a'.repeat(100);
      expect(() => validationService.validateTitleLength(title)).not.toThrow();
    });

    it('should not throw for title at max length', () => {
      const title = 'a'.repeat(200);
      expect(() => validationService.validateTitleLength(title)).not.toThrow();
    });

    it('should throw ValidationError for title exceeding max length', () => {
      const title = 'a'.repeat(201);
      
      expect(() => validationService.validateTitleLength(title)).toThrow(ValidationError);
      
      try {
        validationService.validateTitleLength(title);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('title');
        expect((error as ValidationError).message).toContain('200');
      }
    });
  });
});
