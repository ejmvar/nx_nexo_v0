import { test, expect } from '@playwright/test';

test.describe('NEXO Portal Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('/');
  });

  test('has title and portal selection', async ({ page }) => {
    // Check main page title
    await expect(page).toHaveTitle(/NEXO/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('NEXO Multi-Portal CRM');

    // Check portal selection cards
    await expect(page.locator('text=Employee Portal')).toBeVisible();
    await expect(page.locator('text=Client Portal')).toBeVisible();
    await expect(page.locator('text=Supplier Portal')).toBeVisible();
    await expect(page.locator('text=Professional Portal')).toBeVisible();
  });

  test('navigates to employee portal', async ({ page }) => {
    // Click on Employee Portal button
    await page.locator('text=Employee Portal').click();

    // Check if navigated to employee portal
    await expect(page).toHaveURL(/.*employee/);
    await expect(page.locator('text=Employee Portal')).toBeVisible();
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('navigates to client portal', async ({ page }) => {
    // Click on Client Portal button
    await page.locator('text=Client Portal').click();

    // Check if navigated to client portal
    await expect(page).toHaveURL(/.*client/);
    await expect(page.locator('text=Client Portal')).toBeVisible();
  });

  test('navigates to supplier portal', async ({ page }) => {
    // Click on Supplier Portal button
    await page.locator('text=Supplier Portal').click();

    // Check if navigated to supplier portal
    await expect(page).toHaveURL(/.*supplier/);
    await expect(page.locator('text=Supplier Portal')).toBeVisible();
  });

  test('navigates to professional portal', async ({ page }) => {
    // Click on Professional Portal button
    await page.locator('text=Professional Portal').click();

    // Check if navigated to professional portal
    await expect(page).toHaveURL(/.*professional/);
    await expect(page.locator('text=Professional Portal')).toBeVisible();
  });

  test('employee portal has navigation menu', async ({ page }) => {
    // Navigate to employee portal
    await page.locator('text=Employee Portal').click();

    // Check navigation menu items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=My Tasks')).toBeVisible();
    await expect(page.locator('text=Team')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
  });

  test('employee portal has quick actions', async ({ page }) => {
    // Navigate to employee portal
    await page.locator('text=Employee Portal').click();

    // Check quick action buttons
    await expect(page.locator('text=View Tasks')).toBeVisible();
    await expect(page.locator('text=View Updates')).toBeVisible();
    await expect(page.locator('text=Start Timer')).toBeVisible();
    await expect(page.locator('text=View Metrics')).toBeVisible();
  });

  test('back navigation works from portals', async ({ page }) => {
    // Navigate to employee portal
    await page.locator('text=Employee Portal').click();

    // Click back button
    await page.locator('text=Back to Portal Selection').click();

    // Should be back to main page
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.locator('text=NEXO Multi-Portal CRM')).toBeVisible();
  });

  test('responsive design - mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that portal cards are still visible
    await expect(page.locator('text=Employee Portal')).toBeVisible();
    await expect(page.locator('text=Client Portal')).toBeVisible();

    // Navigate to employee portal
    await page.locator('text=Employee Portal').click();

    // Check mobile layout
    await expect(page.locator('text=Employee Portal')).toBeVisible();
  });

  test('all portals load within performance budget', async ({ page }) => {
    const portals = [
      { name: 'Employee Portal', selector: 'text=Employee Portal' },
      { name: 'Client Portal', selector: 'text=Client Portal' },
      { name: 'Supplier Portal', selector: 'text=Supplier Portal' },
      { name: 'Professional Portal', selector: 'text=Professional Portal' },
    ];

    for (const portal of portals) {
      // Measure navigation time
      const startTime = Date.now();

      await page.locator(portal.selector).click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      console.log(`${portal.name} load time: ${loadTime}ms`);

      // Assert load time is reasonable (< 5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // Navigate back
      await page.locator('text=Back to Portal Selection').click();
    }
  });
});

test.describe('Portal Features', () => {
  test('employee portal displays user information', async ({ page }) => {
    await page.locator('text=Employee Portal').click();

    // Check user avatar and name
    await expect(page.locator('text=John Doe')).toBeVisible();

    // Check user role chips
    await expect(page.locator('text=Active Employee')).toBeVisible();
    await expect(page.locator('text=Software Developer')).toBeVisible();
  });

  test('employee portal shows recent activity', async ({ page }) => {
    await page.locator('text=Employee Portal').click();

    // Check recent activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=Completed task')).toBeVisible();
    await expect(page.locator('text=Team meeting')).toBeVisible();
  });
});
