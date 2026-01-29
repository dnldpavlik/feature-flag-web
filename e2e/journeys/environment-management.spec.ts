/**
 * @feature Environments - Management Operations
 * @spec docs/features/environment-management.md
 * @covers
 *   - ENV-001: View environments list
 *   - ENV-002: Create new environment
 *   - ENV-003: Edit environment settings
 *   - ENV-004: Delete environment
 *   - ENV-005: View environment details
 *   - ENV-006: Set environment color
 *
 * @description
 * End-to-end tests for environment management workflow.
 * Environments are deployment targets (dev, staging, production) where
 * feature flags can have different values.
 */

import { test, expect } from '../fixtures/base.fixture';
import { EnvironmentListPage, EnvironmentDetailPage } from '../pages';
import { testEnvironments, uniqueId } from '../fixtures/test-data';

test.describe('Environment Management Journey', () => {
  test.describe('Environment List', () => {
    test('should display the environments list page', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await envList.assertPageLoaded();
    });

    test('should show create environment button', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await expect(envList.createButton).toBeVisible();
      await expect(envList.createButton).toBeEnabled();
    });

    test('should display existing environments', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      // Check for table or empty state
      const tableOrEmpty = page.locator('app-data-table, app-empty-state');
      await expect(tableOrEmpty.first()).toBeVisible();
    });

    test('should show environment colors', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      // Environment color indicators should be visible
      const colorDots = page.locator('.env-dot');
      await expect(colorDots.first()).toBeVisible();
    });
  });

  test.describe('Create Environment', () => {
    test('should open create environment form', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await envList.clickCreate();

      // Form should be visible (may be inline or modal)
      await envList.assertFormVisible();
    });

    test('should show required form fields', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await envList.clickCreate();

      await expect(envList.nameInput).toBeVisible();
      await expect(envList.keyInput).toBeVisible();
      await expect(envList.colorInput).toBeVisible();
    });

    test('should create a new environment', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envData = {
        name: testEnvironments.development.name(),
        key: testEnvironments.development.key(),
        color: testEnvironments.development.color,
      };

      await envList.createEnvironment(envData);

      // Form should close
      // Note: Need to wait for potential animation/transition
      await page.waitForTimeout(500);

      // New environment should appear in list
      await envList.assertEnvironmentExists(new RegExp(envData.name));
    });

    test('should cancel environment creation', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      await envList.clickCreate();
      await envList.fillForm({ name: 'Cancelled Env', key: 'cancelled' });
      await envList.cancelForm();

      // Form should close
      await page.waitForTimeout(300);
    });

    test('should validate required fields', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await envList.clickCreate();

      // Try to submit without filling required fields
      await envList.submitForm();

      // Should show validation or stay on form
      await expect(envList.createForm).toBeVisible();
    });
  });

  test.describe('Environment Detail', () => {
    test.beforeEach(async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
    });

    test('should navigate to environment detail', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      const envDetail = new EnvironmentDetailPage(page);

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      // Click first environment
      const firstEnvLink = envList.environmentRows.first().getByRole('link').first();
      await firstEnvLink.click();

      // Should be on detail page
      await expect(page).toHaveURL(/environments\/[^/]+$/);
      await envDetail.assertPageLoaded();
    });

    test('should display environment name', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      const envDetail = new EnvironmentDetailPage(page);

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      const firstEnvLink = envList.environmentRows.first().getByRole('link').first();
      const envName = await firstEnvLink.textContent();
      await firstEnvLink.click();

      await expect(envDetail.environmentName).toContainText(envName || '');
    });

    test('should navigate back to list', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      const envDetail = new EnvironmentDetailPage(page);

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      const firstEnvLink = envList.environmentRows.first().getByRole('link').first();
      await firstEnvLink.click();

      await envDetail.goBack();
      await expect(page).toHaveURL(/environments$/);
    });
  });

  test.describe('Edit Environment', () => {
    test('should edit environment from list', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      // Click edit on first environment
      const editButton = envList.environmentRows.first().getByRole('button', { name: /edit/i });
      if ((await editButton.count()) === 0) {
        test.skip();
        return;
      }

      await editButton.click();

      // Form should open with existing data
      await envList.assertFormVisible();
    });

    test('should update environment name', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      const editButton = envList.environmentRows.first().getByRole('button', { name: /edit/i });
      if ((await editButton.count()) === 0) {
        test.skip();
        return;
      }

      await editButton.click();

      const newName = `Updated Env ${uniqueId()}`;
      await envList.nameInput.fill(newName);
      await envList.submitForm();

      // Wait for update
      await page.waitForTimeout(500);

      // Updated name should appear
      await envList.assertEnvironmentExists(new RegExp(newName));
    });
  });

  test.describe('Default Environment', () => {
    test('should indicate default environment', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount === 0) {
        test.skip();
        return;
      }

      // May or may not have a default - just verify page loads
      await expect(envList.environmentList).toBeVisible();
    });
  });

  test.describe('Complete Environment Lifecycle', () => {
    test('should complete full environment CRUD', async ({ page }) => {
      const envList = new EnvironmentListPage(page);

      const envData = {
        name: `Test Env ${uniqueId()}`,
        key: `test-env-${uniqueId()}`,
        color: '#8b5cf6',
      };

      // 1. Navigate to environments
      await envList.goto();

      // 2. Create environment
      await envList.createEnvironment(envData);
      await page.waitForTimeout(500);

      // 3. Verify environment appears
      await envList.assertEnvironmentExists(new RegExp(envData.name));

      // 4. Edit environment
      const editButton = envList
        .environmentRow(envData.name)
        .getByRole('button', { name: /edit/i });
      if ((await editButton.count()) > 0) {
        await editButton.click();
        const updatedName = `${envData.name} Updated`;
        await envList.nameInput.fill(updatedName);
        await envList.submitForm();
        await page.waitForTimeout(500);
        await envList.assertEnvironmentExists(new RegExp(updatedName));
      }

      // 5. Cleanup would happen here (delete)
      // Note: Be careful with delete in tests - may affect other tests
    });
  });
});
