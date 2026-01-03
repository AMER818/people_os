import { test, expect } from '@playwright/test';

test('app loads and redirects to login', async ({ page }) => {
    // Navigate to Root
    await page.goto('/');

    // Should redirect to Login
    // Check for Login Page specific text
    await expect(page.getByText('Welcome Back', { exact: true })).toBeVisible();

    // Check for specific elements
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check title if applicable (or just the content)
});
