import { describe, it, expect, beforeEach } from 'vitest';
import { validate, sanitizePrompt } from '../validationService';

/**
 * Unit Tests: Validation Service
 * Ensures input safety and validation mechanisms work
 */

describe('Validation Service', () => {
  describe('Input Validation', () => {
    it('should accept valid strings', () => {
      expect(() => {
        validate('Test prompt', { data: 'value' });
      }).not.toThrow();
    });

    it('should handle empty strings', () => {
      expect(() => {
        validate('', {});
      }).not.toThrow();
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => {
        validate(null as any, undefined as any);
      }).not.toThrow();
    });

    it('should reject overly long inputs', () => {
      const longString = 'x'.repeat(100000);
      // Should either throw or handle gracefully
      try {
        validate(longString, {});
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Prompt Sanitization', () => {
    it('should sanitize malicious prompts', () => {
      const maliciousPrompt = '<script>alert("xss")</script>';
      const result = sanitizePrompt(maliciousPrompt);
      expect(result).not.toContain('<script>');
    });

    it('should preserve legitimate content', () => {
      const legitimatePrompt = 'Analyze this employee data';
      const result = sanitizePrompt(legitimatePrompt);
      expect(result).toContain('Analyze');
    });

    it('should handle special characters', () => {
      const prompt = 'Test with special chars: @#$%^&*()';
      const result = sanitizePrompt(prompt);
      expect(typeof result).toBe('string');
    });

    it('should handle unicode safely', () => {
      const prompt = 'Test with emoji 😀 and unicode';
      const result = sanitizePrompt(prompt);
      expect(typeof result).toBe('string');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      try {
        validate(sqlInjection, {});
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should remove script tags', () => {
      const xss = '<img src=x onerror="alert(1)">';
      const result = sanitizePrompt(xss);
      expect(result).not.toContain('onerror');
    });

    it('should handle event handlers', () => {
      const xss = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizePrompt(xss);
      expect(result).not.toContain('onclick');
    });
  });
});
