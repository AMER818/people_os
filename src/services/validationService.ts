/**
 * AI Input Validation Service
 * Standardized checks for prompts and data snapshots before AI processing.
 */

export const validate = (prompt: string, data?: any) => {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid AI Prompt: Prompt must be a non-empty string.');
    }

    if (prompt.length > 5000) {
        throw new Error('Invalid AI Prompt: Prompt exceeds maximum length (5000 chars).');
    }

    // Basic snapshot safety
    if (data) {
        const dataStr = JSON.stringify(data);
        if (dataStr.length > 50000) {
            throw new Error('Invalid AI Data: Context data exceeds safety limits.');
        }
    }

    return true;
};

export const sanitizePrompt = (prompt: string): string => {
    // Remove potentially malicious control characters or patterns if necessary
    return prompt.trim();
};
