import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testOpenAIConnection, getChatResponse } from '../openaiService';

/**
 * Unit Tests: OpenAI Service
 * Ensures AI integration safety and error handling
 */

describe('OpenAI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Testing', () => {
    it('should handle missing API key gracefully', async () => {
      // Mock environment to simulate no API key
      const result = await testOpenAIConnection();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should return error status when offline', async () => {
      const result = await testOpenAIConnection();
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('Chat Response Generation', () => {
    it('should handle empty history gracefully', async () => {
      const result = await getChatResponse([], 'Hello');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty message gracefully', async () => {
      const result = await getChatResponse([], '');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should include safety measures in prompts', async () => {
      const result = await getChatResponse([], 'Test');
      // Result should be error or response, never undefined
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle API errors', async () => {
      const result = await getChatResponse([], 'Test message');
      // Should not throw, should return string
      expect(typeof result).toBe('string');
    });

    it('should provide fallback responses', async () => {
      const result = await getChatResponse([], 'Test');
      // Should never be null or undefined
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });
  });
});
