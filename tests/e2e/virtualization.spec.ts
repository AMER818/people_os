import { test, expect } from '@playwright/test';

test.describe('DataGrid Virtualization', () => {
    test.beforeEach(async ({ page }) => {
        // Intercept designations API to return 1000 items
        await page.route('**/api/designations**', async route => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: `D-${i}`,
                name: `Position ${i}`,
                gradeId: `G-${i % 8}`,
                isActive: true
            }));
            await route.fulfill({ json: largeDataset });
        });

        // Login
        await page.goto('/');
        if (await page.url().includes('/login')) {
            await page.fill('input[type="text"]', 'admin');
            await page.fill('input[type="password"]', 'admin');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
        }
    });

    test('should virtualize large datasets', async ({ page }) => {
        // Navigate to Org Setup
        await page.click('text=Org Setup');

        // Wait for Org Setup to load
        await expect(page.getByText('Organization Overview')).toBeVisible();

        // Click Positions Tab
        await page.click('button:has-text("Positions")');

        // Wait for table
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Check number of rendered rows
        // Using a short timeout to allow virtualizer to settle
        await page.waitForTimeout(500);

        const rows = page.locator('tbody tr');
        const count = await rows.count();

        console.log(`Rendered rows: ${count}`);

        // Should be significantly less than 1000, probably around 20-30 depending on height
        expect(count).toBeLessThan(100);
        expect(count).toBeGreaterThan(0);

        // Scroll down
        // The scroll container is inside the DataGrid
        const scrollContainer = page.locator('.overflow-auto.overscroll-contain');
        await scrollContainer.evaluate(node => node.scrollTop = 5000);
        await page.waitForTimeout(500); // Allow render

        // Check that different rows are rendered
        const scrollCount = await rows.count();
        expect(scrollCount).toBeLessThan(100);
    });
});
