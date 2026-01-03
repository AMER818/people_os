import { test as base, expect } from '@playwright/test';

/**
 * Test configuration for Playwright E2E tests
 * Base URL: http://localhost:5173 (Vite dev server)
 * Timeout: 30 seconds per test
 */

// Extend base test with custom fixtures
export const test = base.extend({
    // Add custom authentication fixture
    authenticatedPage: async ({ page }, use) => {
        //Navigate to login
        await page.goto('/');

        // Fill login form
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for navigation to dashboard
        await page.waitForURL('**/dashboard');

        // Use the authenticated page
        await use(page);
    },
});

export { expect };
