/**
 * Formatting utility functions for displaying data consistently
 */

/**
 * Formats phone number with international support
 * Supports Pakistan (+92), US (+1), and international formats
 * @param phone - Phone number string to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
    if (!phone) {return '';}

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    if (!digits) {return '';}

    // Add '+' if not present
    let formatted = '+';

    if (digits.startsWith('92')) {
        // Pakistan: +92 3XX XXXXXXX
        formatted += '92 ';
        const rest = digits.slice(2);
        if (rest.length > 0) {formatted += rest.slice(0, 3);}
        if (rest.length > 3) {formatted += ' ' + rest.slice(3, 10);}
        return formatted.trim();
    }

    if (digits.startsWith('1')) {
        // US: +1 (XXX) XXX-XXXX
        formatted += '1 ';
        const rest = digits.slice(1);
        if (rest.length > 0) {formatted += '(' + rest.slice(0, 3);}
        if (rest.length > 3) {formatted += ') ' + rest.slice(3, 6);}
        if (rest.length > 6) {formatted += '-' + rest.slice(6, 10);}
        return formatted.trim();
    }

    // Generic international: +XX XXX XXXX XXXX
    if (digits.length > 0) {formatted += digits.slice(0, 2) + ' ';}
    if (digits.length > 2) {formatted += digits.slice(2, 5) + ' ';}
    if (digits.length > 5) {formatted += digits.slice(5, 9) + ' ';}
    if (digits.length > 9) {formatted += digits.slice(9, 13);}

    return formatted.trim();
}

/**
 * Formats CNIC (Pakistan National ID Card)
 * Format: XXXXX-XXXXXXX-X
 * @param cnic - CNIC string to format
 * @returns Formatted CNIC
  */
export function formatCNIC(cnic: string): string {
    if (!cnic) {return '';}

    const digits = cnic.replace(/\D/g, '').slice(0, 13);

    if (digits.length > 12) {
        return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    }
    if (digits.length > 5) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
}

/**
 * Formats cell phone number (Pakistan)
 * Format: XXXX-XXXXXXX
 * @param cell - Cell phone string to format
 * @returns Formatted cell phone
 */
export function formatCell(cell: string): string {
    if (!cell) {return '';}

    const digits = cell.replace(/\D/g, '').slice(0, 11);

    if (digits.length > 4) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return digits;
}

/**
 * Formats currency amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: PKR)
 * @param locale - Locale for formatting (default: en-PK)
 * @returns Formatted currency string
 */
export function formatCurrency(
    amount: number,
    currency: string = 'PKR',
    locale: string = 'en-PK'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formats date to readable string
 * @param date - Date to format (Date object or ISO string)
 * @param format - Format type ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
    if (!date) {return '';}

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
        short: { year: 'numeric', month: 'numeric', day: 'numeric' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    };

    return new Intl.DateTimeFormat('en-US', optionsMap[format]).format(dateObj);
}

/**
 * Formats time to readable string
 * @param date - Date object or ISO string
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted time string
 */
export function formatTime(
    date: Date | string,
    includeSeconds: boolean = false
): string {
    if (!date) {return '';}

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
    };

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Auto-formats URL by adding https:// if missing
 * @param url - URL string to format
 * @returns Formatted URL
 */
export function autoFormatURL(url: string): string {
    if (!url) {return '';}
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) {return '0 Bytes';}

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Formats percentage
 * @param value - Value to format as percentage (0-1 or 0-100)
 * @param decimals - Number of decimal places
 * @param isDecimal - Whether value is already decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(
    value: number,
    decimals: number = 1,
    isDecimal: boolean = true
): string {
    const percentage = isDecimal ? value * 100 : value;
    return `${percentage.toFixed(decimals)}%`;
}

/**
 * Capitalizes first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
    if (!text) {return '';}
    return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated text
 */
export function truncateText(
    text: string,
    maxLength: number,
    ellipsis: string = '...'
): string {
    if (!text || text.length <= maxLength) {return text;}
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}
