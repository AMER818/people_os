/**
 * Security utilities for the HCM application
 * Provides input sanitization, validation, and security helpers
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Note: For production, consider using DOMPurify library
 */
export const sanitizeHTML = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitize user input for display
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate CNIC format (Pakistan National ID)
 */
export const isValidCNIC = (cnic: string): boolean => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

/**
 * Validate environment variables at startup
 */
export const validateEnvVars = (): void => {
  const required = ['VITE_GEMINI_API_KEY'];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Rate limiter utility
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) { }

  setMaxRequests(max: number): void {
    this.maxRequests = max;
  }

  getMaxRequests(): number {
    return this.maxRequests;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }

    return false;
  }

  getRemainingTime(): number {
    if (this.timestamps.length < this.maxRequests) {
      return 0;
    }

    const oldestTimestamp = this.timestamps[0];
    const resetTime = oldestTimestamp + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * Debounce utility to limit function calls
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }

  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  return masked + visible;
};
