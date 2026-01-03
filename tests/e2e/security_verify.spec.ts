import { test, expect } from './fixtures';

test.describe('Security & RBAC Verification', () => {

    test('Test 1: Admin Login & Privileged Action (Create Employee)', async ({ page }) => {
        // 1. Login as Admin
        console.log('Login as Admin...');
        await page.goto('/');
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // 2. Navigate to Employee Master
        console.log('Navigating to Employees...');
        await page.click('text=Employees'); // Selector verified from 02-employee-crud.spec.ts
        await page.waitForURL('**/employees');

        // 3. Click "Add Employee"
        console.log('Clicking Add...');
        await page.click('button:has-text("Add")');

        // Wait for animation/hydration
        await page.waitForTimeout(3000);

        // 4. Fill minimal form
        console.log('Filling Form...');
        // Using timestamp to ensure unique code/name
        const timestamp = Date.now();
        await page.fill('div:has(label:has-text("Full Name *")) input', `Security Test Admin ${timestamp}`);
        await page.locator('input[placeholder="00000-0000000-0"]').fill(`12345-${timestamp.toString().substring(0, 7)}-9`); // CNIC strict format
        await page.fill('div:has(label:has-text("Father Name *")) input', 'Test Father');
        await page.fill('div:has(label:has-text("Date of Birth *")) input', '1990-01-01');

        // Org Structure
        await page.locator('div:has(label:has-text("Organization Name *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("HR Plant *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Designation *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Department *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Shift *")) select').selectOption({ index: 1 });

        // Lifecycle
        await page.locator('div:has(label:has-text("Joining Date *")) input').fill('2024-01-01');
        await page.locator('div:has(label:has-text("Probation Period *")) input').fill('3 Months');

        // 5. Submit
        console.log('Submitting...');
        await page.click('button:has-text("Save Changes")');

        // 6. Expectation
        console.log('Verifying...');
        await expect(page.getByText('Employee Management')).toBeVisible();
        await page.reload();
        await expect(page.getByText(`Security Test Admin ${timestamp}`)).toBeVisible({ timeout: 15000 });

        // 7. Logout
        await page.goto('/login');
    });

    test('Test 2: Project Creator Login & Restricted Action (Create Employee)', async ({ page }) => {
        // 1. Login as .amer
        console.log('Login as .amer...');
        await page.goto('/');
        await page.fill('input[type="text"]', '.amer');
        await page.fill('input[type="password"]', 'amer');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // 2. Navigate to Employee Master
        await page.click('text=Employees');
        await page.waitForURL('**/employees');

        // 3. Click "Add Employee"
        await page.click('button:has-text("Add")');

        await page.waitForTimeout(3000);

        // 4. Fill minimal form
        const timestamp = Date.now();
        await page.fill('div:has(label:has-text("Full Name *")) input', `Security Test Fail ${timestamp}`);
        await page.locator('input[placeholder="00000-0000000-0"]').fill(`54321-${timestamp.toString().substring(0, 7)}-9`);
        await page.fill('div:has(label:has-text("Father Name *")) input', 'Test Father Fail');
        await page.fill('div:has(label:has-text("Date of Birth *")) input', '1990-01-01');

        await page.locator('div:has(label:has-text("Organization Name *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("HR Plant *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Designation *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Department *")) select').selectOption({ index: 1 });
        await page.locator('div:has(label:has-text("Shift *")) select').selectOption({ index: 1 });

        await page.locator('div:has(label:has-text("Joining Date *")) input').fill('2024-01-01');
        await page.locator('div:has(label:has-text("Probation Period *")) input').fill('3 Months');

        // 5. Submit
        await page.click('button:has-text("Save Changes")');

        // 6. Expectation: Failure (403 Forbidden or Error Message)
        console.log('Verifying failure...');
        await expect(page.getByText(/Access Forbidden|failed|403|Error/i)).toBeVisible({ timeout: 10000 });

        // Ensure the employee was NOT created
        await page.reload();
        await expect(page.getByText(`Security Test Fail ${timestamp}`)).not.toBeVisible();
    });

});
