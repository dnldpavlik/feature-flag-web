import { test, expect } from '@playwright/test';

/**
 * Example E2E tests for Feature Flag UI
 * 
 * These tests serve as templates - expand them as features are implemented.
 */

test.describe('Application Shell', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Angular to bootstrap
    await page.waitForSelector('app-root');
    
    // Verify app loaded
    await expect(page).toHaveTitle(/Feature Flag/i);
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test.skip('should allow login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Flag Management', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication setup
    // await loginAsTestUser(page);
  });

  test.skip('should display flag list', async ({ page }) => {
    await page.goto('/projects/test-project/environments/dev/flags');
    
    // Wait for flags to load
    await page.waitForSelector('[data-testid="flag-list"]');
    
    // Verify list is displayed
    await expect(page.getByTestId('flag-list')).toBeVisible();
  });

  test.skip('should create a new flag', async ({ page }) => {
    await page.goto('/projects/test-project/environments/dev/flags');
    
    // Click create button
    await page.getByRole('button', { name: /create flag/i }).click();
    
    // Fill form
    await page.getByLabel('Name').fill('Test Flag');
    await page.getByLabel('Key').fill('test-flag');
    await page.getByLabel('Description').fill('A test feature flag');
    
    // Submit
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify success
    await expect(page.getByText(/flag created/i)).toBeVisible();
  });

  test.skip('should toggle a flag', async ({ page }) => {
    await page.goto('/projects/test-project/environments/dev/flags');
    
    // Find a flag toggle
    const toggle = page.getByRole('switch').first();
    const initialState = await toggle.isChecked();
    
    // Toggle it
    await toggle.click();
    
    // Verify state changed
    await expect(toggle).toBeChecked({ checked: !initialState });
  });
});

test.describe('Accessibility', () => {
  test('should have no accessibility violations on dashboard', async ({ page }) => {
    // This test requires @axe-core/playwright
    // npm install --save-dev @axe-core/playwright
    
    // import { injectAxe, checkA11y } from '@axe-core/playwright';
    
    await page.goto('/');
    
    // TODO: Enable when axe-core is installed
    // await injectAxe(page);
    // await checkA11y(page);
  });
});

/**
 * Helper function to login as test user
 * Implement this based on your auth setup
 */
async function loginAsTestUser(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}
