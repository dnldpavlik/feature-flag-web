/**
 * @feature Selection Persistence
 * @covers
 *   - SP-001: Project selection persists across page reload
 *   - SP-002: Project selection persists across navigation
 *   - SP-003: Environment selection persists across page reload
 *   - SP-004: Breadcrumb select reflects correct value after reload
 *
 * @description
 * Regression tests verifying that project and environment selections
 * are saved to localStorage and restored on page refresh or navigation.
 */

import { test, expect } from '../fixtures/base.fixture';
import { FlagListPage } from '../pages';

test.describe('Selection Persistence', () => {
  test.describe('Project Selection', () => {
    test('should persist project selection across page reload', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Get second project's value
      const secondProjectId = await options[1].getAttribute('value');
      if (!secondProjectId) {
        test.skip();
        return;
      }

      // Switch to second project
      await projectSelector.selectOption(secondProjectId);
      await page.waitForTimeout(300);

      // Verify selection took effect
      const selectionBefore = await projectSelector.inputValue();
      expect(selectionBefore).toBe(secondProjectId);

      // Reload the page
      await page.reload();

      // Verify selection persisted (auto-retries until value matches)
      await expect(projectSelector).toHaveValue(secondProjectId);
    });

    test('should persist project selection across navigation', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      const secondProjectId = await options[1].getAttribute('value');
      if (!secondProjectId) {
        test.skip();
        return;
      }

      // Switch to second project on flags page
      await projectSelector.selectOption(secondProjectId);
      await page.waitForTimeout(300);

      // Navigate to dashboard
      await page.click('a[href*="/dashboard"]');
      await page.waitForURL(/dashboard/);

      // Verify project selection is maintained on dashboard
      await expect(projectSelector).toHaveValue(secondProjectId);

      // Navigate back to flags
      await page.click('a[href*="/flags"]');
      await page.waitForURL(/flags/);

      // Verify project selection is still maintained
      await expect(projectSelector).toHaveValue(secondProjectId);
    });

    test('should persist environment selection across page reload', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const envSelector = page.getByLabel('Environment');

      // Check that environment selector exists and has options
      if ((await envSelector.count()) === 0) {
        test.skip();
        return;
      }

      const envOptions = await envSelector.locator('option').all();
      if (envOptions.length < 2) {
        test.skip();
        return;
      }

      // Get second environment's value
      const secondEnvId = await envOptions[1].getAttribute('value');
      if (!secondEnvId) {
        test.skip();
        return;
      }

      // Switch to second environment
      await envSelector.selectOption(secondEnvId);
      await page.waitForTimeout(300);

      // Verify selection took effect
      const selectionBefore = await envSelector.inputValue();
      expect(selectionBefore).toBe(secondEnvId);

      // Reload the page and wait for Angular to bootstrap
      await page.reload();
      await flagList.waitForPageLoad();
      await flagList.assertPageLoaded();

      // Verify environment selection persisted (auto-retries until value matches)
      await expect(envSelector).toHaveValue(secondEnvId);
    });
  });

  test.describe('Breadcrumb Select Value', () => {
    test('should reflect non-default project in breadcrumb after reload', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const projectSelector = page.locator('app-breadcrumb select[aria-label="Project"]');
      const options = await projectSelector.locator('option').all();

      if (options.length < 2) {
        test.skip();
        return;
      }

      // Get initial (default) project value
      const defaultProjectId = await projectSelector.inputValue();
      const secondProjectId = await options[1].getAttribute('value');
      if (!secondProjectId || secondProjectId === defaultProjectId) {
        // Ensure we're picking a different project
        const altProjectId = await options[0].getAttribute('value');
        if (!altProjectId || altProjectId === defaultProjectId) {
          test.skip();
          return;
        }
      }

      // Switch to second project
      await projectSelector.selectOption(secondProjectId!);
      await page.waitForTimeout(300);

      // Reload the page and wait for Angular to bootstrap
      await page.reload();
      await flagList.waitForPageLoad();
      await flagList.assertPageLoaded();

      // Verify the select element's value matches (auto-retries until value matches)
      await expect(projectSelector).toHaveValue(secondProjectId!);

      // Also verify the selected option attribute is set correctly
      const selectedOption = projectSelector.locator('option[selected], option:checked');
      await expect(selectedOption).toHaveAttribute('value', secondProjectId!);
    });
  });
});
