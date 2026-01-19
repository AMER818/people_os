/**
 * AI Input Validation Service
 * Standardized checks for prompts and data snapshots before AI processing.
 */

export const validate = (prompt: string, data?: any) => {
  if (!prompt || typeof prompt !== 'string') {
    return true; // Handle null/undefined gracefully as per tests
  }

  if (prompt.length > 5000) {
    throw new Error('Invalid AI Prompt: Prompt exceeds maximum length (5000 chars).');
  }

  // SQL Injection Detection
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)/i,
  ];
  if (sqlPatterns.some((pattern) => pattern.test(prompt))) {
    throw new Error('Potential SQL Injection detected in prompt.');
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
  if (!prompt) {return '';}

  return prompt
    .trim()
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/on\w+="[^"]*"/gim, '')
    .replace(/on\w+='[^']*'/gim, '')
    .replace(/on\w+=\w+/gim, '');
};
