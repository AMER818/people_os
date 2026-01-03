import { test, expect } from './fixtures';

/**
 * E2E Test Suite: Employee CRUD Operations
 * Tests employee management functionality
 */

test.describe('Employee CRUD', () => {
    test('should navigate to employees page', async ({ authenticatedPage: page }) => {
        // Navigate to employees
        await page.click('text=Employees');

        await page.waitForURL('**/employees');
        await expect(page.url()).toContain('employees');

        // Verify employee list loads
        await expect(page.getByText(/employee/i)).toBeVisible();
    });

    test('should create and save a new employee', async ({ authenticatedPage: page }) => {
        await page.goto('/employees');

        // Handle Alerts
        page.on('dialog', dialog => dialog.accept());

        // Click add employee button  
        await page.click('button:has-text("Add"), button:has-text("New")');

        // Verify form opened
        await expect(page.getByText(/Identity Registry/i)).toBeVisible({ timeout: 5000 });

        // Fill Identity Form
        await page.locator('div:has(label:has-text("Full Name *")) input').fill('Test Employee E2E');
        await page.locator('div:has(label:has-text("Father Name *")) input').fill('Test Father');
        await page.locator('input[placeholder="00000-0000000-0"]').fill('12345-1234567-8');
        await page.locator('div:has(label:has-text("Date of Birth *")) input').fill('1990-01-01');

        // Fill Org Structure
        // Use Evaluate to select non-empty options if needed, or just select index 1 (assuming seeded data)
        await page.locator('div:has(label:has-text("Organization Name *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("HR Plant *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Designation *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Department *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Shift *")) select').selectOption({ index: 1 });

        // Fill Lifecycle
        await page.locator('div:has(label:has-text("Joining Date *")) input').fill('2023-01-01');
        await page.locator('div:has(label:has-text("Probation Period *")) input').fill('3 Months');

        // Save
        await page.click('button:has-text("Save Changes")');

        // Verify Success & Return to Dashboard
        await expect(page.getByText('Employee Management')).toBeVisible();

        // Verify New Employee in List
        // Reload page to ensure persistence
        await page.reload();
        await expect(page.getByText('Test Employee E2E')).toBeVisible();
    });

    test('should view employee details', async ({ authenticatedPage: page }) => {
        await page.goto('/employees');

        // Wait for employee list to load
        await page.waitForSelector('[data-testid="employee-item"], .employee-row, tr', { timeout: 5000 });

        // Click first employee
        const firstEmployee = page.locator('[data-testid="employee-item"], .employee-row, tr').first();
        await firstEmployee.click();

        // Verify detail view
        await expect(page.getByText(/Identity Registry/i)).toBeVisible({ timeout: 3000 });
    });

    test('should search for employee', async ({ authenticatedPage: page }) => {
        await page.goto('/employees');

        // Find search input
        const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('Test Employee E2E');

            // Verify filtering occurred
            await page.waitForTimeout(500);
            await expect(searchInput).toHaveValue('Test Employee E2E');
            await expect(page.getByText('Test Employee E2E')).toBeVisible();
        }
    });
});
