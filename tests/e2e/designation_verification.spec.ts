import { test, expect } from '@playwright/test';

test.describe('Global Designation & Assignment Verification', () => {
  // Port 5173 for Frontend (dev), 8000 for Backend
  const BASE_URL = 'http://localhost:5173';
  const API_URL = 'http://localhost:8000/api';

  const timestamp = Date.now();
  const testGrade = {
    name: `E2E Grade ${timestamp}`,
    code: `G${timestamp}`,
    level: 1,
    organization_id: 'org-1', // Default org
  };

  const testDesignation = {
    name: `Global Role ${timestamp}`,
    // No departmentId intended
  };

  const testEmployee = {
    first_name: 'Test',
    last_name: `User-${timestamp}`,
    email: `test${timestamp}@example.com`,
    joining_date: '2025-01-01',
    designation_id: '', // Will fill
  };

  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get token for API setup
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin',
      },
    });
    expect(loginRes.ok()).toBeTruthy();
    const data = await loginRes.json();
    authToken = data.access_token;
  });

  test('Verify Global Designation Flow', async ({ page, request }) => {
    test.setTimeout(60000);

    // 1. API: Create Grade (Prerequisite)
    const gradeRes = await request.post(`${API_URL}/grades`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: testGrade,
    });
    expect(gradeRes.ok()).toBeTruthy();
    const grade = await gradeRes.json();

    // 2. UI: Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("Sign In")'); // Matches login screen
    await page.waitForURL('**/dashboard');

    // 3. UI: Create Global Designation
    // Navigate to Org Setup
    await page.click('text=Organization Setup'); // Matches org-structure.spec.ts selector
    await page.waitForSelector('text=Designations (Job Titles)', { timeout: 10000 });

    // Open Modal
    await page.click('button:has-text("Add Designation")');

    // Assert Department Field is GONE
    await expect(page.locator('label:has-text("Department")')).toBeHidden();

    // Fill Form
    await page.fill('input[placeholder="e.g. Senior Developer"]', testDesignation.name);
    // Select Grade
    await page.selectOption('select', { value: grade.id }); // Using value is safer if we know ID

    // Save
    await page.click('button:has-text("Save Designation")');

    // Verify in List
    await expect(page.locator(`text=${testDesignation.name}`)).toBeVisible();

    // 4. UI: Assign to Employee
    // Create Designation object for reference
    // Fetch it via API to retrieve ID ideally, or rely on UI text select
    // Let's use UI text select for assignment

    await page.goto(`${BASE_URL}/employees`);
    await page.click('button:has-text("Add Employee")');

    // Fill Employee Form
    await page.fill('input[name="first_name"]', testEmployee.first_name);
    await page.fill('input[name="last_name"]', testEmployee.last_name);
    await page.fill('input[name="email"]', testEmployee.email);
    await page.fill('input[name="joining_date"]', testEmployee.joining_date);

    // Select Designation
    // Need to find the select or combobox.
    // Assuming standard select based on typical forms, or a div trigger.
    // If it's a searchable select, we type.
    // Looking at EmployeeForm.tsx (not viewed recently), let's guess standard HTML select or MUI.
    // If MUI:
    // await page.click('#designation-select'); // generic
    // Let's try text-based matching which is robust in Playwright
    // If it's a native select:
    const desigSelect = page.locator('select[name="designation_id"]');
    if ((await desigSelect.count()) > 0) {
      // Native select
      // We need the ID.
      // Let's fetch the ID via API first to be safe.
      const dRes = await request.get(`${API_URL}/designations`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const dList = await dRes.json();
      const createdDesig = dList.find((d: any) => d.name === testDesignation.name);
      await desigSelect.selectOption(createdDesig.id);
    } else {
      // Likely MUI Select or Custom
      // Click label or placeholder
      await page.click('text=Select Designation');
      await page.click(`text=${testDesignation.name}`);
    }

    // Save
    await page.click('button:has-text("Create Employee")');

    // Verify List
    await expect(
      page.locator(`text=${testEmployee.first_name} ${testEmployee.last_name}`)
    ).toBeVisible();
    await expect(page.locator(`text=${testDesignation.name}`)).toBeVisible(); // Should show designation in table
  });
});
