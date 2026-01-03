import { test, expect } from '@playwright/test';

test.describe('Virtualization Performance', () => {
    test.beforeEach(async ({ page }) => {
        // Increase timeout for initial load of large dataset
        test.setTimeout(60000);

        // 1. Login
        await page.goto('/login');
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin');
        await page.click('button:has-text("Sign In")');
        await page.waitForURL('/dashboard');

        // 2. Navigate to Org Setup
        await page.click('a[href="/org-setup"]');
        await expect(page.locator('text=Loading Module...')).toBeHidden({ timeout: 60000 });
        await page.waitForSelector('text=Structural Hierarchy', { timeout: 30000 });
    });

    test('should render only visible items (virtualization)', async ({ page }) => {
        // Wait for the tree to load formatted data
        // We look for at least one department being rendered
        const firstDept = page.locator('div[data-testid^="dept-node-"]').first();
        await expect(firstDept).toBeVisible({ timeout: 10000 });

        // Count TOTAL rendered department/sub-department rows in the DOM
        // The virtualizer typically renders visible items + overscan.
        // Even with 1050 items in DB, DOM should have < 50 items.
        const renderedRows = await page.locator('div[data-testid^="dept-node-"]').count();
        const renderedSubs = await page.locator('div[data-testid^="subdept-node-"]').count();
        const totalRendered = renderedRows + renderedSubs;

        console.log(`Total Rendered Nodes in DOM: ${totalRendered}`);

        // Assertion: Virtualization is working if rendered nodes are significantly less than dataset
        expect(totalRendered).toBeLessThan(100);
        expect(totalRendered).toBeGreaterThan(0);
    });

    test('should scroll efficiently to the bottom', async ({ page }) => {
        const scrollContainer = page.locator('.overflow-y-auto'); // The virtual scrolling container

        // Scroll to bottom
        await scrollContainer.evaluate((node) => node.scrollTo(0, node.scrollHeight));

        // Wait for a brief moment for virtualization to catch up (catch new items)
        await page.waitForTimeout(1000);

        // Check if we can see nodes at the bottom (approximated check)
        // Since we don't know the exact last ID easily without querying DB, 
        // we just verify that we still have rendered nodes and no "blank screen".
        const renderedRows = await page.locator('div[data-testid^="dept-node-"]').count();
        expect(renderedRows).toBeGreaterThan(0);

        // Optional: Measure performance? (Playwright doesn't have native FPS, but we can check responsiveness)
        // If this test passes without timeout, performance is generally acceptable.
    });
});
