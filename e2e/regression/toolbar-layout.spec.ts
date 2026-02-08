/**
 * @feature Toolbar Layout & Toggle Status
 * @covers
 *   - TL-001: Flag toggle shows correct "Enabled"/"Disabled" label
 *   - TL-002: Toggle label updates when flag is toggled
 *   - TL-003: Flag list count and export display inline with filters
 *   - TL-004: Flag count format matches "X of Y flags"
 *   - TL-005: Audit page count displays inline with filters
 *   - TL-006: Audit count format matches "X of Y entries"
 *
 * @description
 * Regression tests verifying toggle status text reflects the toggle state
 * and that toolbar counts/actions are positioned inline with filters.
 */

import { test, expect } from '../fixtures/base.fixture';
import { FlagListPage, AuditPage } from '../pages';
import { skipIfEmpty } from '../helpers';

test.describe('Toolbar Layout', () => {
  test.describe('Flag Toggle Status Text', () => {
    test('should display status label matching toggle state', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const flagCount = await flagList.getFlagCount();
      if (skipIfEmpty(flagCount)) return;

      // Get the first toggle's state and label
      const toggleInput = page.locator('app-toggle input').first();
      const toggleLabel = page.locator('app-toggle .toggle__label').first();

      const isChecked = await toggleInput.isChecked();
      const labelText = await toggleLabel.textContent();

      if (isChecked) {
        expect(labelText?.trim()).toBe('Enabled');
      } else {
        expect(labelText?.trim()).toBe('Disabled');
      }
    });

    test('should update status label when flag is toggled', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const flagCount = await flagList.getFlagCount();
      if (skipIfEmpty(flagCount)) return;

      const toggleInput = page.locator('app-toggle input').first();
      const toggleLabel = page.locator('app-toggle .toggle__label').first();
      const toggleClickable = page.locator('app-toggle label.toggle').first();

      // Capture initial state
      const initialChecked = await toggleInput.isChecked();
      const initialLabel = (await toggleLabel.textContent())?.trim();

      // Verify initial label is correct
      expect(initialLabel).toBe(initialChecked ? 'Enabled' : 'Disabled');

      // Toggle the flag
      await toggleClickable.click();

      // Verify label updated (auto-retry for expected text)
      const expectedLabel = initialChecked ? 'Disabled' : 'Enabled';
      await expect(toggleLabel).toHaveText(expectedLabel);

      // Restore original state
      await toggleClickable.click();
      await page.waitForTimeout(300);
    });
  });

  test.describe('Flag List Toolbar Layout', () => {
    test('should display count and export inline with filters', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      // Verify toolbar row contains both the toolbar and meta sections
      const toolbarRow = page.locator('.flags-page__toolbar-row');
      await expect(toolbarRow).toBeVisible();

      // Verify the meta section (count + export) is visible
      const meta = page.locator('.flags-page__meta');
      await expect(meta).toBeVisible();

      // Verify count text is visible
      const count = page.locator('.flags-page__count');
      await expect(count).toBeVisible();

      // Verify export button is visible within meta
      const exportButton = page.getByRole('button', { name: /export/i });
      await expect(exportButton).toBeVisible();

      // Verify count and export are within the toolbar row
      await expect(toolbarRow.locator('.flags-page__meta')).toBeVisible();
      await expect(toolbarRow.locator('.flags-page__count')).toBeVisible();
    });

    test('should show correct flag count format', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();

      const count = page.locator('.flags-page__count');
      await expect(count).toBeVisible();

      // Count text should match "X of Y flags" pattern
      const countText = await count.textContent();
      expect(countText?.trim()).toMatch(/^\d+ of \d+ flags$/);
    });
  });

  test.describe('Audit List Toolbar Layout', () => {
    test('should display count inline with filters on audit page', async ({ page }) => {
      const auditPage = new AuditPage(page);
      await auditPage.goto();

      // Verify toolbar row contains both toolbar and count
      const toolbarRow = page.locator('.audit-page__toolbar-row');
      await expect(toolbarRow).toBeVisible();

      // Verify count is visible
      const count = page.locator('.audit-page__count');
      await expect(count).toBeVisible();

      // Verify count is within the toolbar row
      await expect(toolbarRow.locator('.audit-page__count')).toBeVisible();
    });

    test('should show correct entry count format', async ({ page }) => {
      const auditPage = new AuditPage(page);
      await auditPage.goto();

      const count = page.locator('.audit-page__count');
      await expect(count).toBeVisible();

      // Count text should match "X of Y entries" pattern
      const countText = await count.textContent();
      expect(countText?.trim()).toMatch(/^\d+ of \d+ entries$/);
    });
  });
});
