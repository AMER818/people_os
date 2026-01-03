
import { test, expect } from './fixtures';

test.describe('Organization Structure Management', () => {

    test.beforeEach(async ({ authenticatedPage: page }) => {
        // Navigate to Org Setup
        await page.click('text=Org Setup');
        await expect(page.getByText('Organizational Hierarchy')).toBeVisible({ timeout: 10000 });
    });

    test('should create department and sub-department', async ({ authenticatedPage: page }) => {
        const deptName = `E2E Dept ${Date.now()}`;
        const deptCode = `D-${Date.now().toString().slice(-4)}`;
        const subDeptName = `E2E Sub ${Date.now()}`;
        const subDeptCode = `SD-${Date.now().toString().slice(-4)}`;

        // Handle prompts
        page.on('dialog', async dialog => {
            const msg = dialog.message();
            console.log(`Dialog message: ${msg}`);

            if (msg.includes('Enter Department Name')) {
                await dialog.accept(deptName);
            } else if (msg.includes('Enter Department Code')) {
                await dialog.accept(deptCode);
            } else if (msg.includes('Enter Sub-Department Name')) {
                await dialog.accept(subDeptName);
            } else if (msg.includes('Enter Sub-Department Code')) {
                await dialog.accept(subDeptCode);
            } else if (msg.includes('Enter Parent Department Code')) {
                await dialog.accept(deptCode);
            } else {
                await dialog.accept();
            }
        });

        // 1. Create Department
        // Ensure "Department" tab is active (it is by default usually, but let's check tabs)
        // OrgSettings has tabs: General, Structure, Grades, Shifts...
        // Structure is the second tab id='structure'
        await page.click('button:has-text("Department")'); // Click Tab

        await page.click('button:has-text("Add Department")');

        // Verify Dept Created
        await expect(page.getByText(deptName)).toBeVisible();
        await expect(page.getByText(deptCode)).toBeVisible();

        // 2. Create Sub-Department
        await page.click('button:has-text("Add Sub-Dept")');

        // Verify Sub-Dept Created
        await expect(page.getByText(subDeptName)).toBeVisible();
        await expect(page.getByText(subDeptCode)).toBeVisible();
    });

    test('should create grade and designation', async ({ authenticatedPage: page }) => {
        const gradeName = `G-${Date.now().toString().slice(-4)}`;
        const gradeLevel = "5";
        const desigName = `Desig ${Date.now()}`;

        // Handle prompts
        page.on('dialog', async dialog => {
            const msg = dialog.message();

            if (msg.includes('Enter Grade Name')) {
                await dialog.accept(gradeName);
            } else if (msg.includes('Enter Level Number')) {
                await dialog.accept(gradeLevel);
            } else if (msg.includes('Enter Designation Name')) {
                await dialog.accept(desigName);
            } else {
                await dialog.accept(gradeName); // For "Enter Grade Name" prompt in Designation creation
            }
        });

        // Click "Grade & Designation" Tab
        await page.click('button:has-text("Grade & Designation")');

        // Create Grade
        await page.click('button:has-text("Add Grade")');
        await expect(page.getByText(gradeName)).toBeVisible();

        // Create Designation
        await page.click('button:has-text("Add Designation")');
        await expect(page.getByText(desigName)).toBeVisible();
    });

    test('should create shift', async ({ authenticatedPage: page }) => {
        // Click "Shifts" Tab
        await page.click('button:has-text("Shifts")');

        // This opens a modal, NOT a prompt
        await page.click('button:has-text("Add Shift")');
        await expect(page.getByText('Add Shift', { exact: true })).toBeVisible(); // Wait for header

        const shiftName = `Shift ${Date.now()}`;
        const shiftCode = `S-${Date.now().toString().slice(-4)}`;

        // Fill Modal
        // OrgSettings sets setEditShift({ isOpen: true ... })
        // Need selectors for the modal inputs.
        // Assuming they are standard inputs in the modal

        await page.fill('input[placeholder="e.g. General Shift"]', shiftName);
        await page.fill('input[placeholder="e.g. G"]', shiftCode);

        await page.click('button:has-text("Save Shift")');

        await expect(page.getByText(shiftName)).toBeVisible();
        await expect(page.getByText(shiftCode)).toBeVisible();
    });
});
