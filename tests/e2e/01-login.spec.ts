import { test, expect } from './fixtures';

/**
 * E2E Test Suite: Login Flow
 * Tests the authentication system
 */

test.describe('Login Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto('/');

        // Check page title
        await expect(page).toHaveTitle(/People OS/);

        // Check for login form elements
        await expect(page.getByText('Welcome Back')).toBeVisible();
        await expect(page.locator('input[type="text"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
        await page.goto('/');

        // Fill in credentials
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin');

        // Click login button
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // Verify we're on dashboard
        await expect(page.url()).toContain('dashboard');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/');

        // Fill invalid credentials
        await page.fill('input[type="text"]', 'wronguser');
        await page.fill('input[type="password"]', 'wrongpass');

        // Click login
        await page.click('button[type="submit"]');

        // Check for error message
        await expect(page.getByText(/invalid|failed/i)).toBeVisible({ timeout: 3000 });
    });
});
