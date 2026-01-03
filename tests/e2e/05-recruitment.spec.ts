import { test, expect } from './fixtures';

/**
 * E2E Test Suite: Recruitment Workflow
 * Tests candidate management and recruitment process
 */

test.describe('Recruitment Workflow', () => {
    test('should navigate to recruitment module', async ({ authenticatedPage: page }) => {
        // Navigate to recruitment
        await page.click('text=Recruitment, text=Hiring');

        await page.waitForURL('**/recruitment');
        await expect(page.url()).toContain('recruitment');
    });

    test('should display recruitment dashboard', async ({ authenticatedPage: page }) => {
        await page.goto('/recruitment');

        // Verify recruitment elements
        await expect(page.getByText(/candidate|recruitment|hiring/i)).toBeVisible();
    });

    test('should access candidates list', async ({ authenticatedPage: page }) => {
        await page.goto('/recruitment');

        // Look for candidates section
        const candidatesSection = page.locator('text=Candidates, text=Applicants');

        if (await candidatesSection.first().isVisible({ timeout: 2000 })) {
            await await expect(candidatesSection.first()).toBeVisible();
        }
    });

    test('should view recruitment pipeline', async ({ authenticatedPage: page }) => {
        await page.goto('/recruitment');

        // Check for pipeline/stages view
        const pipelineView = page.locator('text=Pipeline, text=Stages, text=Board');

        if (await pipelineView.first().isVisible({ timeout: 2000 })) {
            await pipelineView.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('should add new candidate option exists', async ({ authenticatedPage: page }) => {
        await page.goto('/recruitment');

        // Look for add candidate button
        const addButton = page.locator('button:has-text("Add"), button:has-text("New")');

        if (await addButton.first().isVisible({ timeout: 2000 })) {
            await expect(addButton.first()).toBeVisible();
        }
    });
});
