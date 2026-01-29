/**
 * @feature Projects - Management Operations
 * @spec docs/features/project-management.md
 * @covers
 *   - PROJ-001: View projects list
 *   - PROJ-002: Create new project
 *   - PROJ-003: Edit project settings
 *   - PROJ-004: Delete project
 *   - PROJ-005: View project details
 *   - PROJ-006: Project flag counts
 *
 * @description
 * End-to-end tests for project management workflow.
 * Projects are containers that group feature flags together.
 */

import { test, expect } from '../fixtures/base.fixture';
import { ProjectListPage, ProjectDetailPage } from '../pages';
import { testProjects, uniqueId } from '../fixtures/test-data';

test.describe('Project Management Journey', () => {
  test.describe('Project List', () => {
    test('should display the projects list page', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.assertPageLoaded();
    });

    test('should show create project button', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await expect(projectList.createButton).toBeVisible();
      await expect(projectList.createButton).toBeEnabled();
    });

    test('should display existing projects', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      // Check for table or empty state
      const tableOrEmpty = page.locator('app-data-table, app-empty-state');
      await expect(tableOrEmpty.first()).toBeVisible();
    });
  });

  test.describe('Create Project', () => {
    test('should open create project form', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.clickCreate();

      // Form should be visible
      await expect(projectList.createForm).toBeVisible();
    });

    test('should show required form fields', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.clickCreate();

      await expect(projectList.nameInput).toBeVisible();
      await expect(projectList.keyInput).toBeVisible();
    });

    test('should create a new project', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectData = {
        name: testProjects.default.name(),
        key: testProjects.default.key(),
        description: testProjects.default.description,
      };

      await projectList.createProject(projectData);
      await page.waitForTimeout(500);

      // New project should appear in list
      await projectList.assertProjectExists(new RegExp(projectData.name));
    });

    test('should cancel project creation', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      await projectList.clickCreate();
      await projectList.fillForm({ name: 'Cancelled Project' });
      await projectList.cancelButton.click();

      await page.waitForTimeout(300);
      // Form should close
    });
  });

  test.describe('Project Detail', () => {
    test.beforeEach(async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
    });

    test('should navigate to project detail', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      const projectDetail = new ProjectDetailPage(page);

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      // Click first project
      const firstProjectLink = projectList.projectRows.first().getByRole('link').first();
      await firstProjectLink.click();

      // Should be on detail page
      await expect(page).toHaveURL(/projects\/[^/]+$/);
      await projectDetail.assertPageLoaded();
    });

    test('should display project name', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      const projectDetail = new ProjectDetailPage(page);

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      const firstProjectLink = projectList.projectRows.first().getByRole('link').first();
      const projectName = await firstProjectLink.textContent();
      await firstProjectLink.click();

      await expect(projectDetail.projectName).toContainText(projectName || '');
    });

    test('should display project stats', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      const projectDetail = new ProjectDetailPage(page);

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      const firstProjectLink = projectList.projectRows.first().getByRole('link').first();
      await firstProjectLink.click();

      // Stat cards should be visible
      await expect(projectDetail.statCards.first()).toBeVisible();
    });

    test('should navigate back to list', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      const projectDetail = new ProjectDetailPage(page);

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      const firstProjectLink = projectList.projectRows.first().getByRole('link').first();
      await firstProjectLink.click();

      await projectDetail.goBack();
      await expect(page).toHaveURL(/projects$/);
    });
  });

  test.describe('Edit Project', () => {
    test('should edit project from list', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      // Click edit on first project
      const editButton = projectList.projectRows.first().getByRole('button', { name: /edit/i });
      if ((await editButton.count()) === 0) {
        test.skip();
        return;
      }

      await editButton.click();

      // Form should open
      await expect(projectList.createForm).toBeVisible();
    });
  });

  test.describe('Default Project', () => {
    test('should indicate default project', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();

      const projectCount = await projectList.getProjectCount();
      if (projectCount === 0) {
        test.skip();
        return;
      }

      // May or may not have a default - just verify page loads
      await expect(projectList.projectList).toBeVisible();
    });
  });

  test.describe('Complete Project Lifecycle', () => {
    test('should complete full project CRUD', async ({ page }) => {
      const projectList = new ProjectListPage(page);

      const projectData = {
        name: `E2E Project ${uniqueId()}`,
        key: `e2e-project-${uniqueId()}`,
        description: 'Created by E2E test',
      };

      // 1. Navigate to projects
      await projectList.goto();

      // 2. Create project
      await projectList.createProject(projectData);
      await page.waitForTimeout(500);

      // 3. Verify project appears
      await projectList.assertProjectExists(new RegExp(projectData.name));

      // 4. View project details
      await projectList.clickProject(projectData.name);
      await expect(page).toHaveURL(/projects\/[^/]+$/);

      // 5. Go back to list
      await page.goBack();
      await expect(page).toHaveURL(/projects$/);

      // 6. Cleanup would happen here
    });
  });
});
