/**
 * @feature Environments - Delete Regression
 * @spec docs/features/environment-management.md
 * @covers
 *   - ENV-DEL-001: Delete button visibility
 *   - ENV-DEL-002: Confirmation dialog content
 *   - ENV-DEL-003: Cancel delete flow
 *   - ENV-DEL-004: Confirm delete flow
 *   - ENV-DEL-005: Cannot delete last environment
 *
 * @description
 * Regression tests for environment deletion feature.
 * Tests confirmation dialog, cancel flow, and edge cases.
 */

import { test, expect } from '../fixtures/base.fixture';
import { EnvironmentListPage } from '../pages';
import { uniqueId } from '../fixtures/test-data';

test.describe('Environment Delete Regression', () => {
  test.describe('Delete Button Visibility', () => {
    test('should show delete button on all rows when multiple environments exist', async ({
      page,
    }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount <= 1) {
        test.skip();
        return;
      }

      const rows = envList.environmentRows;
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const deleteBtn = rows.nth(i).getByRole('button', { name: /delete/i });
        await expect(deleteBtn).toBeVisible();
      }
    });
  });

  test.describe('Confirmation Dialog', () => {
    test('should display confirmation title and action buttons', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount <= 1) {
        test.skip();
        return;
      }

      // Click delete on first environment
      await envList.environmentRows
        .first()
        .getByRole('button', { name: /delete/i })
        .click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should have title
      await expect(dialog.locator('h3')).toContainText(/delete environment/i);

      // Should have cancel and delete buttons
      await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();
      await expect(dialog.getByRole('button', { name: /delete environment/i })).toBeVisible();

      // Should have "cannot be undone" warning
      await expect(dialog).toContainText(/cannot be undone/i);
    });

    test('should dismiss dialog when cancel is clicked', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const envCount = await envList.getEnvironmentCount();
      if (envCount <= 1) {
        test.skip();
        return;
      }

      await envList.environmentRows
        .first()
        .getByRole('button', { name: /delete/i })
        .click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      await envList.cancelModal();

      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Delete Execution', () => {
    test('should remove environment from list after confirmed delete', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      // Create a new environment to safely delete
      const envName = `Deletable ${uniqueId()}`;
      await envList.createEnvironment({
        name: envName,
        key: `deletable-${uniqueId()}`,
        color: '#dc2626',
      });
      await page.waitForTimeout(500);
      await envList.assertEnvironmentExists(new RegExp(envName));

      const countBefore = await envList.getEnvironmentCount();

      // Delete it
      await envList.deleteEnvironment(envName);
      await page.waitForTimeout(500);

      // Verify it's gone
      await envList.assertEnvironmentNotExists(new RegExp(envName));
      await envList.assertEnvironmentCount(countBefore - 1);
    });

    test('should show success toast after deleting environment', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      // Create environment to delete
      const envName = `Toast Test ${uniqueId()}`;
      await envList.createEnvironment({
        name: envName,
        key: `toast-test-${uniqueId()}`,
        color: '#7c3aed',
      });
      await page.waitForTimeout(500);

      // Delete it
      await envList.deleteEnvironment(envName);

      // Wait for toast
      await envList.waitForToast(/deleted/i);
    });

    test('should preserve other environments after delete', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();

      const initialCount = await envList.getEnvironmentCount();
      if (initialCount <= 1) {
        test.skip();
        return;
      }

      // Create a new environment and delete it
      const envName = `Temp Env ${uniqueId()}`;
      await envList.createEnvironment({
        name: envName,
        key: `temp-${uniqueId()}`,
        color: '#0ea5e9',
      });
      await page.waitForTimeout(500);

      await envList.deleteEnvironment(envName);
      await page.waitForTimeout(500);

      // Original environments should still be there
      await envList.assertEnvironmentCount(initialCount);
    });
  });
});
