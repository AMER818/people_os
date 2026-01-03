/**
 * Validation utility functions for form inputs
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
    if (!email) {return null;}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }

    return null;
}

/**
 * Validates required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message if empty, null if valid
 */
export function validateRequired(value: string, fieldName: string): string | null {
    if (!value || value.trim() === '') {
        return `${fieldName} is required`;
    }
    return null;
}

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePhone(phone: string): string | null {
    if (!phone) {return null;}

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Should have at least 10 digits for valid phone number
    if (digits.length < 10) {
        return 'Phone number must have at least 10 digits';
    }

    return null;
}

/**
 * Validates CNIC format (Pakistan National ID)
 * @param cnic - CNIC string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCNIC(cnic: string): string | null {
    if (!cnic) {return null;}

    // Remove all non-digit characters
    const digits = cnic.replace(/\D/g, '');

    // CNIC should be exactly 13 digits
    if (digits.length !== 13) {
        return 'CNIC must be 13 digits (XXXXX-XXXXXXX-X)';
    }

    return null;
}

/**
 * Validates organization code format
 * @param code - Organization code to validate
 * @returns Error message if invalid, null if valid
 */
export function validateOrgCode(code: string): string | null {
    if (!code) {return null;}

    if (code.length < 3 || code.length > 5) {
        return 'Org code must be 3-5 characters';
    }

    if (!/^[A-Za-z0-9]+$/.test(code)) {
        return 'Only letters and numbers allowed';
    }

    return null;
}

/**
 * Generic pattern validator
 * @param value - Value to validate
 * @param pattern - Regular expression pattern
 * @param errorMessage - Custom error message
 * @returns Error message if invalid, null if valid
 */
export function validatePattern(
    value: string,
    pattern: RegExp,
    errorMessage: string
): string | null {
    if (!value) {return null;}

    if (!pattern.test(value)) {
        return errorMessage;
    }

    return null;
}

/**
 * Validates minimum length
 * @param value - Value to validate
 * @param minLength - Minimum required length
 * @param fieldName - Name of the field for error message
 * @returns Error message if too short, null if valid
 */
export function validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
): string | null {
    if (!value) {return null;}

    if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters`;
    }

    return null;
}

/**
 * Validates maximum length
 * @param value - Value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @returns Error message if too long, null if valid
 */
export function validateMaxLength(
    value: string,
    maxLength: number,
    fieldName: string
): string | null {
    if (!value) {return null;}

    if (value.length > maxLength) {
        return `${fieldName} must be no more than ${maxLength} characters`;
    }

    return null;
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns Error message if invalid, null if valid
 */
export function validateURL(url: string): string | null {
    if (!url) {return null;}

    try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return null;
    } catch {
        return 'Invalid URL format';
    }
}
