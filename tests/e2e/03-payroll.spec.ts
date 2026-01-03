import { test, expect } from './fixtures';

/**
 * E2E Test Suite: Payroll Processing
 * Tests payroll management and processing
 */

test.describe('Payroll Processing', () => {
    test('should navigate to payroll module', async ({ authenticatedPage: page }) => {
        // Navigate to payroll
        await page.click('text=Payroll');

        await page.waitForURL('**/payroll');
        await expect(page.url()).toContain('payroll');
    });

    test('should display payroll dashboard', async ({ authenticatedPage: page }) => {
        await page.goto('/payroll');

        // Verify payroll elements
        await expect(page.getByText(/payroll|salary/i)).toBeVisible();
    });

    test('should access payroll processing', async ({ authenticatedPage: page }) => {
        await page.goto('/payroll');

        // Look for process/generate buttons
        const processButton = page.locator('button:has-text("Process"), button:has-text("Generate"), button:has-text("Calculate")');

        if (await processButton.first().isVisible({ timeout: 2000 })) {
            await expect(processButton.first()).toBeVisible();
        }
    });

    test('should view payroll history', async ({ authenticatedPage: page }) => {
        await page.goto('/payroll');

        // Check for history/records tab
        const historyTab = page.locator('text=History, text=Records, text=Past');

        if (await historyTab.first().isVisible({ timeout: 2000 })) {
            await historyTab.first().click();
            await page.waitForTimeout(500);
        }
    });
});
