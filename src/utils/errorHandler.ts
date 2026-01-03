/**
 * Error handling utilities for the HCM application
 * Provides centralized error management, logging, and user-friendly error messages
 */

/**
 * Custom application error class with additional context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Error codes for consistent error handling across the application
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // API errors
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Business logic errors
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',

  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * User-friendly error messages
 */
const errorMessages: Record<string, string> = {
  [ErrorCodes.NETWORK_ERROR]:
    'Unable to connect to the server. Please check your internet connection.',
  [ErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCodes.API_ERROR]: 'An error occurred while processing your request.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action. Please log in.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
  [ErrorCodes.BUSINESS_LOGIC_ERROR]: 'Unable to complete this operation.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.',
};

/**
 * Convert any error to an AppError
 */
export const handleError = (error: unknown): AppError => {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCodes.UNKNOWN_ERROR, 500, {
      originalError: error.name,
    });
  }

  // If it's an API response error
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if ('status' in errorObj && 'message' in errorObj) {
      const status = errorObj.status as number;
      const message = errorObj.message as string;

      if (status === 404) {
        return new AppError(message, ErrorCodes.NOT_FOUND, 404);
      }
      if (status === 401) {
        return new AppError(message, ErrorCodes.UNAUTHORIZED, 401);
      }
      if (status === 403) {
        return new AppError(message, ErrorCodes.FORBIDDEN, 403);
      }

      return new AppError(message, ErrorCodes.API_ERROR, status);
    }
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', ErrorCodes.UNKNOWN_ERROR, 500, { error });
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: AppError): string => {
  return errorMessages[error.code] || error.message || errorMessages[ErrorCodes.UNKNOWN_ERROR];
};

/**
 * Log error to console (in development) or error tracking service (in production)
 */
export const logError = (error: AppError, context?: string): void => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.error(`[${context || 'Error'}]`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    });
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { tags: { context } });
    console.error(`[${context || 'Error'}]`, error.code, error.message);
  }
};

/**
 * Retry utility for API calls
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw new AppError(
    `Failed after ${maxAttempts} attempts: ${lastError!.message}`,
    ErrorCodes.NETWORK_ERROR,
    500,
    { attempts: maxAttempts, lastError: lastError! }
  );
};
