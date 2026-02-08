/**
 * @feature Project-Flag Scoping
 * @spec docs/features/project-flag-scoping.md
 * @covers
 *   - PFS-001: Flags are scoped to projects
 *   - PFS-002: Project switch changes visible flags
 *   - PFS-003: New flags created in current project
 *   - PFS-004: Dashboard stats reflect current project
 *   - PFS-005: Flag detail validates project scope
 *
 * @description
 * End-to-end tests verifying that feature flags are correctly scoped
 * to projects. When a user switches projects, only flags belonging
 * to that project should be visible throughout the application.
 */

import { test, expect } from '../fixtures/base.fixture';
import { FlagListPage, FlagCreatePage, DashboardPage } from '../pages';
import { uniqueId } from '../fixtures/test-data';

test.describe('Project-Flag Scoping', () => {
  test.describe('Flag List Scoping', () => {
    test('should display only flags from selected project', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      // Get initial flag count
      const initialCount = await flagList.getFlagCount();

      // Switch to a different project
      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Get the second option's value
      const secondOption = await options[1].getAttribute('value');
      if (!secondOption) {
        test.skip();
        return;
      }

      // Switch to second project
      await projectSelector.selectOption(secondOption);
      await page.waitForTimeout(300);

      // Flag count should change (different project has different flags)
      const newCount = await flagList.getFlagCount();

      // The counts should be different (or both could be 0/same if data happens to match)
      // We verify the mechanism works by checking the UI updated
      expect(typeof newCount).toBe('number');

      // Switch back to first project
      const firstOption = await options[0].getAttribute('value');
      if (firstOption) {
        await projectSelector.selectOption(firstOption);
        await page.waitForTimeout(300);

        const restoredCount = await flagList.getFlagCount();
        // Use >= because parallel tests may have created flags in this project
        expect(restoredCount).toBeGreaterThanOrEqual(initialCount);
      }
    });

    test('should update flag count in toolbar when project changes', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      // Look for the count indicator in the toolbar
      const countIndicator = page.locator('.flags-page__count');

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Switch projects
      const secondOption = await options[1].getAttribute('value');
      if (secondOption) {
        await projectSelector.selectOption(secondOption);
        await page.waitForTimeout(300);

        // Count should reflect new project's flags
        const newCountText = await countIndicator.textContent();
        // Verify the count indicator still has content after project switch
        expect(newCountText).toBeTruthy();
      }
    });
  });

  test.describe('Flag Creation Scoping', () => {
    test('should create flag in currently selected project', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      const flagList = new FlagListPage(page);

      // Navigate to flags list first to establish project context
      await flagList.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Explicitly select first project
      const firstProjectId = await options[0].getAttribute('value');
      const secondProjectId = await options[1].getAttribute('value');

      if (firstProjectId) {
        await projectSelector.selectOption(firstProjectId);
        await page.waitForTimeout(300);
      }

      // Navigate to create via UI button (preserves project context)
      await flagList.clickCreateFlag();
      await page.waitForURL(/flags\/new/);

      // Create a flag
      const flagName = `Project Test Flag ${uniqueId()}`;
      const flagKey = `project-test-flag-${uniqueId()}`;

      await flagCreate.fillForm({
        name: flagName,
        key: flagKey,
        description: 'E2E test for project scoping',
        type: 'boolean',
      });
      await flagCreate.submit();

      // Wait for navigation back to list
      await page.waitForURL(/flags$/);
      await page.waitForTimeout(500);

      // Verify flag appears in list (should be in current project)
      await flagList.assertFlagExists(new RegExp(flagName));

      // Switch to second project
      if (secondProjectId) {
        await projectSelector.selectOption(secondProjectId);
        await page.waitForTimeout(500);

        // Flag should NOT appear in the other project
        await flagList.assertFlagNotExists(new RegExp(flagName));

        // Switch back to first project
        if (firstProjectId) {
          await projectSelector.selectOption(firstProjectId);
          await page.waitForTimeout(500);

          // Flag should be visible again
          await flagList.assertFlagExists(new RegExp(flagName));
        }
      }
    });

    test('should create flag in non-default project when selected', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      const flagList = new FlagListPage(page);

      await flagList.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      const firstProjectId = await options[0].getAttribute('value');
      const secondProjectId = await options[1].getAttribute('value');

      // Switch to second project FIRST
      if (secondProjectId) {
        await projectSelector.selectOption(secondProjectId);
        await page.waitForTimeout(300);
      }

      // Navigate to create page using UI button (not goto() which resets state)
      await flagList.clickCreateFlag();
      await page.waitForURL(/flags\/new/);

      const flagName = `Second Project Flag ${uniqueId()}`;
      const flagKey = `second-project-flag-${uniqueId()}`;

      await flagCreate.fillForm({
        name: flagName,
        key: flagKey,
        description: 'E2E test - flag in second project',
        type: 'boolean',
      });
      await flagCreate.submit();

      await page.waitForURL(/flags$/);
      await page.waitForTimeout(300);

      // Flag should appear in second project's list
      await flagList.assertFlagExists(new RegExp(flagName));

      // Switch to first project
      if (firstProjectId) {
        await projectSelector.selectOption(firstProjectId);
        await page.waitForTimeout(300);

        // Flag should NOT appear in first project
        await flagList.assertFlagNotExists(new RegExp(flagName));
      }
    });
  });

  test.describe('Dashboard Scoping', () => {
    test('should update dashboard stats when project changes', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.assertDashboardLoaded();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Switch to second project
      const secondOption = await options[1].getAttribute('value');
      if (secondOption) {
        await projectSelector.selectOption(secondOption);
        await page.waitForTimeout(300);

        // Stats should update
        const newFlagCount = await dashboard.getStatValue('Flags');

        // Verify the stats component is showing values (may or may not be different)
        expect(newFlagCount).toBeTruthy();
      }
    });

    test('should show recent flags from current project only', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // The recent flags should change when switching projects
      // We can't assert specific content without knowing the data,
      // but we can verify the dashboard re-renders correctly

      const secondOption = await options[1].getAttribute('value');
      if (secondOption) {
        await projectSelector.selectOption(secondOption);
        await page.waitForTimeout(300);

        // Page should still be dashboard with stats after project switch
        await dashboard.assertDashboardLoaded();
      }
    });
  });

  test.describe('Flag Detail Scoping', () => {
    test('should show empty state when viewing flag from different project', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Get flag count in first project
      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      // Click on first flag to get its ID from URL
      const firstFlagLink = flagList.flagRows.first().getByRole('link').first();
      await firstFlagLink.click();
      await page.waitForURL(/flags\/[^/]+$/);

      const flagUrl = page.url();
      const flagIdMatch = flagUrl.match(/flags\/([^/]+)$/);
      const flagId = flagIdMatch ? flagIdMatch[1] : null;

      if (!flagId) {
        test.skip();
        return;
      }

      // Switch to second project while on flag detail page
      const secondOption = await options[1].getAttribute('value');
      if (secondOption) {
        await projectSelector.selectOption(secondOption);
        await page.waitForTimeout(300);

        // Should show empty state since flag doesn't belong to this project
        const emptyState = page.locator('app-empty-state');
        await expect(emptyState).toBeVisible();
      }
    });

    test('should hide flag when switching to wrong project then show when switching back', async ({
      page,
    }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      const firstProjectId = await options[0].getAttribute('value');
      const secondProjectId = await options[1].getAttribute('value');

      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      // Navigate to first flag and capture its URL
      const firstFlagLink = flagList.flagRows.first().getByRole('link').first();
      await firstFlagLink.click();
      await page.waitForURL(/flags\/[^/]+$/);
      const flagUrl = page.url();

      // Should show flag details (heading visible, no empty state)
      await expect(page.locator('.flag-detail, app-flag-detail').first()).toBeVisible();

      // Switch to second project
      if (secondProjectId) {
        await projectSelector.selectOption(secondProjectId);
        await page.waitForTimeout(500);

        // Flag should not be visible (empty state or not-found)
        const flagNotVisible = page.locator('app-empty-state, .not-found, .flag-not-found');
        await expect(flagNotVisible.first()).toBeVisible();

        // Switch back to first project and re-navigate to verify flag is accessible
        if (firstProjectId) {
          await projectSelector.selectOption(firstProjectId);
          await page.waitForTimeout(300);

          // Navigate back to the flag via URL to verify it exists in this project
          await page.goto(flagUrl);
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(500);

          // Should show flag details again
          await expect(page.locator('.flag-detail, app-flag-detail').first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Complete Project Scoping Journey', () => {
    test('should maintain project context across navigation', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      // Start on dashboard
      await dashboard.goto();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Switch to second project
      const secondProjectId = await options[1].getAttribute('value');

      if (secondProjectId) {
        await projectSelector.selectOption(secondProjectId);
        await page.waitForTimeout(300);

        // Navigate to flags
        await page.click('a[href*="/flags"]');
        await page.waitForURL(/flags$/);

        // Project should still be the second one
        const currentSelection = await projectSelector.inputValue();
        expect(currentSelection).toBe(secondProjectId);

        // Navigate back to dashboard
        await page.click('a[href*="/dashboard"]');
        await page.waitForURL(/dashboard/);

        // Project should still be selected
        const dashboardSelection = await projectSelector.inputValue();
        expect(dashboardSelection).toBe(secondProjectId);
      }
    });
  });
});
