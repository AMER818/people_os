import { test, expect } from '@playwright/test';

test.describe('Organization Structure - Department & Sub-Department CRUD', () => {
    const BASE_URL = 'http://localhost:4040';
    const API_URL = 'http://localhost:3002/api';

    // Test data
    const testDept1 = {
        id: 'E2E-DEPT-1',
        name: 'E2E Test Marketing',
        code: 'E2E-MKT',
        isActive: true
    };

    const testDept2 = {
        id: 'E2E-DEPT-2',
        name: 'E2E Test Sales',
        code: 'E2E-SLS',
        isActive: true
    };

    const testSubDept = {
        id: 'E2E-SUB-1',
        name: 'E2E Digital Marketing',
        code: 'E2E-MKT-01',
        parentDepartmentId: testDept1.id,
        isActive: true
    };

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        // Login to get auth token
        const loginRes = await request.post(`${API_URL}/auth/login`, {
            data: {
                username: 'admin',
                password: 'admin'
            }
        });

        const loginData = await loginRes.json();
        authToken = loginData.access_token;
        expect(authToken).toBeTruthy();
    });

    test.beforeEach(async ({ page }) => {
        // Navigate to app and login
        await page.goto(BASE_URL);

        // Store auth token in localStorage/sessionStorage if needed
        await page.evaluate((token) => {
            localStorage.setItem('auth_token', token);
        }, authToken);
    });

    test('should create department via UI', async ({ page }) => {
        test.setTimeout(120000);
        await page.click('text=Organization Setup');
        await expect(page.locator('text=Loading Module...')).toBeHidden({ timeout: 30000 });

        // Click Add Department button
        await page.click('button:has-text("Add Root Unit")');

        // Fill form
        await page.fill('input[name="name"]', testDept1.name);
        await page.fill('input[name="code"]', testDept1.code);

        // Submit
        await page.click('button:has-text("Save")');

        // Verify department appears in tree using data-testid
        await page.waitForSelector(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`);
        await expect(page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`)).toBeVisible();
    });

    test('should create sub-department via UI', async ({ page }) => {
        test.setTimeout(120000);
        await page.goto(`${BASE_URL}/org-setup`);
        await expect(page.locator('text=Loading Module...')).toBeHidden({ timeout: 30000 });

        // Find parent department and click add sub-department using data-testid
        const parentNode = page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`);
        await parentNode.hover();

        // Find the specific add button for this parent
        const addBtn = parentNode.locator('[data-testid^="add-subdept-"]');
        await addBtn.click();

        // Fill sub-department form
        await page.fill('input[name="name"]', testSubDept.name);

        // Code should auto-generate, verify it exists
        const codeInput = page.locator('input[name="code"]');
        await expect(codeInput).not.toBeEmpty();

        // Submit
        await page.click('button:has-text("Save")');

        // Expand parent to see sub-department using data-testid
        const expandBtn = parentNode.locator('[data-testid^="expand-button-"]');
        await expandBtn.click();

        // Verify sub-department appears using data-testid
        await expect(page.locator(`[data-testid^="subdept-node-"]:has-text("${testSubDept.name}")`)).toBeVisible();
    });

    test('should persist sub-department after page reload', async ({ page }) => {
        test.setTimeout(120000);
        await page.goto(`${BASE_URL}/org-setup`);
        await expect(page.locator('text=Loading Module...')).toBeHidden({ timeout: 30000 });

        // Expand parent department
        const parentNode = page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`);
        await parentNode.locator('[data-testid^="expand-button-"]').click();

        // Verify sub-department still exists
        await expect(page.locator(`[data-testid^="subdept-node-"]:has-text("${testSubDept.name}")`)).toBeVisible();
    });

    test('should update sub-department name and verify persistence', async ({ page }) => {
        await page.goto(`${BASE_URL}/org-setup`);

        // Expand first department
        const parentNode = page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`);
        await parentNode.locator('[data-testid^="expand-button-"]').click();

        // Edit sub-department
        const subNode = page.locator(`[data-testid^="subdept-node-"]:has-text("${testSubDept.name}")`);
        await subNode.hover();
        await subNode.locator('[data-testid^="edit-subdept-"]').click();

        // Change name
        const updatedName = testSubDept.name + ' Updated';
        await page.fill('input[name="name"]', updatedName);

        // Save
        await page.click('button:has-text("Save")');

        // Reload to verify persistence
        await page.reload();

        // Expand
        await page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`).locator('[data-testid^="expand-button-"]').click();

        // Verify updated name
        await expect(page.locator(`[data-testid^="subdept-node-"]:has-text("${updatedName}")`)).toBeVisible();
    });

    test('edge case: should prevent duplicate department codes', async ({ page }) => {
        await page.goto(`${BASE_URL}/org-setup`);
        await page.click('button:has-text("Add Root Unit")');

        await page.fill('input[name="name"]', 'Duplicate Dept');
        await page.fill('input[name="code"]', testDept1.code); // Use existing code

        await page.click('button:has-text("Save")');

        // Should show error toast (based on OrgSetup.tsx logic)
        await expect(page.locator('.toast-error')).toBeVisible();
    });

    test('edge case: should prevent deleting department with sub-departments', async ({ page }) => {
        await page.goto(`${BASE_URL}/org-setup`);

        const parentNode = page.locator(`[data-testid^="dept-node-"]:has-text("${testDept1.name}")`);
        await parentNode.hover();

        // Click delete
        await parentNode.locator('[data-testid^="delete-dept-"]').click();

        // Confirm in modal (if any) or check for error if logic is immediate
        // Based on OrgSetup.tsx confirmDelete logic: it checks dependencies
        await page.click('button:has-text("Confirm")');

        await expect(page.locator('.toast-error')).toContainText('Cannot delete department with sub-departments');
    });

    test.afterAll(async ({ request }) => {
        // Cleanup: Delete test data
        try {
            await request.delete(`${API_URL}/sub-departments/${testSubDept.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            await request.delete(`${API_URL}/departments/${testDept1.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            await request.delete(`${API_URL}/departments/${testDept2.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (e) {
            console.log('Cleanup failed (non-critical):', e);
        }
    });
});
