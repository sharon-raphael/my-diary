/**
 * Error codes for storage-related errors.
 */
export type StorageErrorCode =
  | 'QUOTA_EXCEEDED'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CORRUPTED_DATA';

/**
 * Custom error class for storage-related errors.
 */
export class StorageError extends Error {
  public code: StorageErrorCode;

  constructor(message: string, code: StorageErrorCode) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}

/**
 * Custom error class for validation errors.
 */
export class ValidationError extends Error {
  public field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
