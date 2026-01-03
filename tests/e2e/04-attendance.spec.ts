import { test, expect } from './fixtures';

/**
 * E2E Test Suite: Attendance Tracking
 * Tests attendance management and tracking
 */

test.describe('Attendance Tracking', () => {
    test('should navigate to attendance module', async ({ authenticatedPage: page }) => {
        //Navigate to attendance
        await page.click('text=Attendance');

        await page.waitForURL('**/attendance');
        await expect(page.url()).toContain('attendance');
    });

    test('should display attendance dashboard', async ({ authenticatedPage: page }) => {
        await page.goto('/attendance');

        // Verify attendance elements
        await expect(page.getByText(/attendance|present|absent/i)).toBeVisible();
    });

    test('should access manual attendance entry', async ({ authenticatedPage: page }) => {
        await page.goto('/attendance');

        // Look for manual entry button/tab
        const manualEntry = page.locator('text=Manual, text=Entry, text=Mark');

        if (await manualEntry.first().isVisible({ timeout: 2000 })) {
            await manualEntry.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('should view attendance reports', async ({ authenticatedPage: page }) => {
        await page.goto('/attendance');

        // Check for reports tab
        const reportsTab = page.locator('text=Reports, text=Analytics');

        if (await reportsTab.first().isVisible({ timeout: 2000 })) {
            await reportsTab.first().click();
            await page.waitForTimeout(500);
        }
    });
});
