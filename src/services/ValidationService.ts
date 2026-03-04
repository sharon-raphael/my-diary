import type { Entry, Mood } from '../types/entry';
import { ValidationError } from '../types/errors';

/**
 * Result of import data validation.
 */
export interface ImportValidationResult {
  /** Whether the import data is valid */
  valid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Array of valid entries that passed validation */
  validEntries: Entry[];
  /** Count of invalid entries that failed validation */
  invalidCount: number;
}

/**
 * ValidationService validates entry data integrity and sanitizes content.
 * Provides type guards and validation functions for ensuring data correctness.
 */
export class ValidationService {
  // Content length limits
  private static readonly MAX_CONTENT_LENGTH = 100000;
  private static readonly MAX_TITLE_LENGTH = 200;

  // Valid mood values
  private static readonly VALID_MOODS: readonly Mood[] = [
    'happy',
    'sad',
    'excited',
    'anxious',
    'calm',
    'grateful',
    'reflective',
    'energetic'
  ] as const;

  /**
   * Type guard to validate if an unknown value is a valid Entry.
   * @param entry - The value to validate
   * @returns True if the value is a valid Entry
   */
  validateEntry(entry: unknown): entry is Entry {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const e = entry as Record<string, unknown>;

    // Validate required string fields
    if (typeof e.id !== 'string' || e.id.trim() === '') {
      return false;
    }

    if (typeof e.title !== 'string') {
      return false;
    }

    if (typeof e.content !== 'string') {
      return false;
    }

    // Validate timestamps
    if (typeof e.createdAt !== 'number' || !Number.isFinite(e.createdAt) || e.createdAt < 0) {
      return false;
    }

    if (typeof e.lastModifiedAt !== 'number' || !Number.isFinite(e.lastModifiedAt) || e.lastModifiedAt < 0) {
      return false;
    }

    // Validate mood (must be null or a valid mood string)
    if (e.mood !== null) {
      if (typeof e.mood !== 'string' || !ValidationService.VALID_MOODS.includes(e.mood as Mood)) {
        return false;
      }
    }

    // Validate tags array
    if (!Array.isArray(e.tags)) {
      return false;
    }

    // All tags must be non-empty strings
    if (!e.tags.every(tag => typeof tag === 'string' && tag.trim() !== '')) {
      return false;
    }

    // Validate version
    if (typeof e.version !== 'number' || !Number.isInteger(e.version) || e.version < 1) {
      return false;
    }

    // Validate content length
    if (e.content.length > ValidationService.MAX_CONTENT_LENGTH) {
      return false;
    }

    // Validate title length
    if (e.title.length > ValidationService.MAX_TITLE_LENGTH) {
      return false;
    }

    return true;
  }

  /**
   * Type guard to validate if an unknown value is an array of valid Entries.
   * @param data - The value to validate
   * @returns True if the value is an array of valid Entries
   */
  validateEntryArray(data: unknown): data is Entry[] {
    if (!Array.isArray(data)) {
      return false;
    }

    return data.every(entry => this.validateEntry(entry));
  }

  /**
   * Sanitizes content to prevent XSS attacks.
   * Removes potentially dangerous HTML tags and attributes.
   * @param content - The content to sanitize
   * @returns Sanitized content
   */
  sanitizeContent(content: string): string {
    if (typeof content !== 'string') {
      return '';
    }

    // List of dangerous tags to remove
    const dangerousTags = [
      'script',
      'iframe',
      'object',
      'embed',
      'link',
      'style',
      'meta',
      'base',
      'form',
      'input',
      'button',
      'textarea',
      'select'
    ];

    let sanitized = content;

    // Remove dangerous tags and their content
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
      sanitized = sanitized.replace(regex, '');
      
      // Also remove self-closing versions
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    return sanitized;
  }

  /**
   * Validates import data and provides detailed error reporting.
   * @param data - The data to validate (should be parsed JSON)
   * @returns Validation result with valid entries and error details
   */
  validateImportData(data: unknown): ImportValidationResult {
    const result: ImportValidationResult = {
      valid: false,
      errors: [],
      validEntries: [],
      invalidCount: 0
    };

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      result.errors.push('Import data must be an object');
      return result;
    }

    const container = data as Record<string, unknown>;

    // Check for entries array
    if (!container.entries) {
      result.errors.push('Import data must contain an "entries" field');
      return result;
    }

    if (!Array.isArray(container.entries)) {
      result.errors.push('The "entries" field must be an array');
      return result;
    }

    // Validate each entry
    container.entries.forEach((entry, index) => {
      try {
        if (this.validateEntry(entry)) {
          // Additional sanitization for valid entries
          const validEntry = entry as Entry;
          validEntry.content = this.sanitizeContent(validEntry.content);
          result.validEntries.push(validEntry);
        } else {
          result.invalidCount++;
          result.errors.push(`Entry at index ${index} failed validation`);
        }
      } catch (error) {
        result.invalidCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Entry at index ${index} threw error: ${errorMessage}`);
      }
    });

    // Check if we have at least one valid entry
    if (result.validEntries.length > 0) {
      result.valid = true;
    } else if (container.entries.length > 0) {
      result.errors.push('No valid entries found in import data');
    } else {
      result.errors.push('Import data contains an empty entries array');
    }

    return result;
  }

  /**
   * Validates content length.
   * @param content - The content to validate
   * @throws {ValidationError} If content exceeds maximum length
   */
  validateContentLength(content: string): void {
    if (content.length > ValidationService.MAX_CONTENT_LENGTH) {
      throw new ValidationError(
        `Content exceeds maximum length of ${ValidationService.MAX_CONTENT_LENGTH} characters`,
        'content'
      );
    }
  }

  /**
   * Validates title length.
   * @param title - The title to validate
   * @throws {ValidationError} If title exceeds maximum length
   */
  validateTitleLength(title: string): void {
    if (title.length > ValidationService.MAX_TITLE_LENGTH) {
      throw new ValidationError(
        `Title exceeds maximum length of ${ValidationService.MAX_TITLE_LENGTH} characters`,
        'title'
      );
    }
  }
}

// Export a singleton instance
export const validationService = new ValidationService();
