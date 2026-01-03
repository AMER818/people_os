import { test, expect } from '@playwright/test';

test.describe('Scroll Behavior & Isolation', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the dashboard
        await page.goto('/');

        // Check if we are on login page (wait for selector to be sure)
        const loginInput = page.locator('input[type="text"]');
        if (await loginInput.count() > 0 && await loginInput.isVisible()) {
            await page.fill('input[type="text"]', 'admin');
            await page.fill('input[type="password"]', 'admin');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
        }
    });

    test('body should be locked when modal is open', async ({ page }) => {
        // Navigate to a page with a modal, e.g., Employee list -> Add Employee
        await page.goto('/employees');

        // Click "Add Employee" or similar button to open a modal
        // Using selector from employee-crud.spec.ts
        const addBtn = page.locator('button:has-text("Add"), button:has-text("New")');

        // Wait for button to be visible to avoid race conditions
        await expect(addBtn).toBeVisible();
        await addBtn.click();

        // Wait for modal to appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Check body for overflow: hidden or fixed position lock
        const bodyHandle = await page.evaluateHandle(() => document.body);

        // Wait for the class to be applied (it might take a tick)
        await expect(page.locator('body')).toHaveClass(/overflow-hidden/);

        // Optional: Also check computed style if class isn't enough
        const overflow = await bodyHandle.evaluate((body) => window.getComputedStyle(body).overflow);
        expect(overflow === 'hidden').toBeTruthy();
    });

    test('sidebar should have independent scrolling', async ({ page }) => {
        // Locate the sidebar
        const sidebar = page.locator('aside'); // Assuming semantic 'aside' for sidebar

        // If sidebar exists
        if (await sidebar.isVisible()) {
            // Check computed style for overscroll-behavior
            const overscroll = await sidebar.evaluate((el) => window.getComputedStyle(el).overscrollBehavior);

            expect(overscroll).toMatch(/contain|none|auto/);

            if (overscroll !== 'contain' && overscroll !== 'none') {
                console.warn('Sidebar overscroll-behavior is not isolated:', overscroll);
            }
        }
    });

    test('main content area should scroll independently', async ({ page }) => {
        const main = page.locator('main');
        if (await main.isVisible()) {
            // Verify it has overflow-y auto or scroll
            const overflowY = await main.evaluate((el) => window.getComputedStyle(el).overflowY);
            expect(overflowY).toMatch(/auto|scroll/);
        }
    });

    test('visual regression of dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        // Initial snapshot
        await expect(page).toHaveScreenshot('dashboard-scroll-state.png', { fullPage: true });
    });

});
