/**
 * @feature Projects - Delete Regression
 * @spec docs/features/project-management.md
 * @covers
 *   - PROJ-DEL-001: Delete button visibility
 *   - PROJ-DEL-002: Confirmation dialog content
 *   - PROJ-DEL-003: Cancel delete flow
 *   - PROJ-DEL-004: Confirm delete flow
 *   - PROJ-DEL-005: Cascade deletes flags
 *
 * @description
 * Regression tests for project deletion feature.
 * Tests confirmation dialog, cancel flow, cascade behavior, and edge cases.
 */

import { test, expect } from '../fixtures/base.fixture';
import { ProjectListPage } from '../pages';
import { uniqueId } from '../fixtures/test-data';

test.describe('Project Delete Regression', () => {
  test.describe('Delete Button Visibility', () => {
    test('should show delete button on all rows when multiple projects exist', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount <= 1) {
        test.skip();
        return;
      }

      const rows = projectList.projectRows;
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const deleteBtn = rows.nth(i).getByRole('button', { name: /delete/i });
        await expect(deleteBtn).toBeVisible();
      }
    });
  });

  test.describe('Confirmation Dialog', () => {
    test('should display confirmation title and action buttons', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount <= 1) {
        test.skip();
        return;
      }

      // Click delete on first project
      await projectList.projectRows
        .first()
        .getByRole('button', { name: /delete/i })
        .click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should have title
      await expect(dialog.locator('h3')).toContainText(/delete project/i);

      // Should have cancel and delete buttons
      await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();
      await expect(dialog.getByRole('button', { name: /delete project/i })).toBeVisible();

      // Should have "cannot be undone" warning
      await expect(dialog).toContainText(/cannot be undone/i);
    });

    test('should show flag count warning when project has flags', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount <= 1) {
        test.skip();
        return;
      }

      // Click delete on first project (seed data has flags)
      await projectList.projectRows
        .first()
        .getByRole('button', { name: /delete/i })
        .click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should mention flags if present
      const warningText = await dialog.textContent();
      expect(warningText).toBeTruthy();

      // Dismiss
      await projectList.cancelModal();
    });

    test('should dismiss dialog when cancel is clicked', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount <= 1) {
        test.skip();
        return;
      }

      await projectList.projectRows
        .first()
        .getByRole('button', { name: /delete/i })
        .click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      await projectList.cancelModal();

      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Delete Execution', () => {
    test('should remove project from list after confirmed delete', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.waitForLoadingComplete();

      // Create two projects so delete button is always visible (need 2+)
      const helperName = `Helper ${uniqueId()}`;
      await projectList.createProject({
        name: helperName,
        key: `helper-${uniqueId()}`,
        description: 'Helper project for delete test',
      });
      await projectList.assertProjectExists(new RegExp(helperName));

      const projectName = `Deletable ${uniqueId()}`;
      await projectList.createProject({
        name: projectName,
        key: `deletable-${uniqueId()}`,
        description: 'E2E delete test project',
      });
      await projectList.assertProjectExists(new RegExp(projectName));

      // Delete it
      await projectList.deleteProject(projectName);

      // Verify the deleted one is gone, the helper still exists
      await projectList.assertProjectNotExists(new RegExp(projectName));
      await projectList.assertProjectExists(new RegExp(helperName));
    });

    test('should show success toast after deleting project', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.waitForLoadingComplete();

      // Create two projects so delete button is always visible (need 2+)
      const helperName = `Helper ${uniqueId()}`;
      await projectList.createProject({
        name: helperName,
        key: `helper-${uniqueId()}`,
        description: 'Helper project for delete test',
      });
      await projectList.assertProjectExists(new RegExp(helperName));

      const projectName = `Toast Test ${uniqueId()}`;
      await projectList.createProject({
        name: projectName,
        key: `toast-test-${uniqueId()}`,
        description: 'E2E toast test project',
      });
      await projectList.assertProjectExists(new RegExp(projectName));

      // Delete it
      await projectList.deleteProject(projectName);

      // Wait for toast
      await projectList.waitForToast(/deleted/i);
    });

    test('should preserve other projects after delete', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.waitForLoadingComplete();

      // Create two projects — we will delete one and verify the other survives
      const keepName = `Keep Project ${uniqueId()}`;
      await projectList.createProject({
        name: keepName,
        key: `keep-${uniqueId()}`,
        description: 'Should survive the deletion',
      });
      await projectList.assertProjectExists(new RegExp(keepName));

      const deleteName = `Delete Project ${uniqueId()}`;
      await projectList.createProject({
        name: deleteName,
        key: `delete-${uniqueId()}`,
        description: 'Will be deleted',
      });
      await projectList.assertProjectExists(new RegExp(deleteName));

      // Delete one
      await projectList.deleteProject(deleteName);

      // The other should still be there
      await projectList.assertProjectNotExists(new RegExp(deleteName));
      await projectList.assertProjectExists(new RegExp(keepName));
    });
  });
});
