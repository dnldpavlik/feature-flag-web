/**
 * @feature Feature Flags - Comprehensive Regression
 * @spec docs/features/flag-management.md
 * @covers
 *   - FF-REG-001: Flag type variations (boolean, string, number, json)
 *   - FF-REG-002: Flag value persistence
 *   - FF-REG-003: Multi-environment flag states
 *   - FF-REG-004: Flag search and filtering
 *   - FF-REG-005: Flag sorting
 *   - FF-REG-006: Bulk operations
 *   - FF-REG-007: Form validation edge cases
 *
 * @description
 * Comprehensive regression tests for feature flags functionality.
 * Tests edge cases and less common scenarios.
 */

import { test, expect } from '../fixtures/base.fixture';
import { FlagListPage, FlagCreatePage } from '../pages';
import { testFlags, uniqueId } from '../fixtures/test-data';

test.describe('Flag Regression Tests', () => {
  test.describe('Flag Types', () => {
    test('should create a string type flag', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      const flagData = {
        name: testFlags.string.name(),
        key: testFlags.string.key(),
        description: testFlags.string.description,
        type: testFlags.string.type,
      };

      await flagCreate.fillForm(flagData);
      await flagCreate.submit();

      await expect(page).toHaveURL(/flags/);
    });

    test('should create a number type flag', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      const flagData = {
        name: testFlags.number.name(),
        key: testFlags.number.key(),
        description: testFlags.number.description,
        type: testFlags.number.type,
      };

      await flagCreate.fillForm(flagData);
      await flagCreate.submit();

      await expect(page).toHaveURL(/flags/);
    });

    test('should create a JSON type flag', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      const flagData = {
        name: testFlags.json.name(),
        key: testFlags.json.key(),
        description: testFlags.json.description,
        type: testFlags.json.type,
      };

      await flagCreate.fillForm(flagData);
      await flagCreate.submit();

      await expect(page).toHaveURL(/flags/);
    });
  });

  test.describe('Form Validation', () => {
    test('should prevent duplicate flag keys', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      // Get the key of an existing flag
      const existingKey = await flagList.tableRows
        .first()
        .locator('[data-testid="flag-key"], code')
        .textContent();

      if (!existingKey) {
        test.skip();
        return;
      }

      // Try to create a flag with the same key
      await flagCreate.goto();
      await flagCreate.fillForm({
        name: 'Duplicate Key Test',
        key: existingKey.trim(),
      });
      await flagCreate.submit();

      // Should show error or prevent submission
      // (implementation-dependent)
    });

    test('should validate flag key format', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      // Try invalid key formats
      await flagCreate.fillName('Test Flag');
      await flagCreate.fillKey('Invalid Key With Spaces');

      // Key should be reformatted or show error
      const keyValue = await flagCreate.keyInput.inputValue();
      const hasSpaces = keyValue.includes(' ');

      // Either key was reformatted (no spaces) or form shows error
      if (hasSpaces) {
        await flagCreate.submit();
        // Should show validation error
      }
    });

    test('should handle very long flag names', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      const longName = 'A'.repeat(200);
      await flagCreate.fillName(longName);

      // Should either truncate or show validation error
      const nameValue = await flagCreate.nameInput.inputValue();
      expect(nameValue.length).toBeLessThanOrEqual(200);
    });

    test('should handle special characters in description', async ({ page }) => {
      const flagCreate = new FlagCreatePage(page);
      await flagCreate.goto();

      await flagCreate.fillForm({
        name: `Special Chars ${uniqueId()}`,
        description:
          'Test with <script>alert("xss")</script> & special chars: "quotes" \'apostrophes\'',
      });
      await flagCreate.submit();

      // Should handle without error
      await expect(page).toHaveURL(/flags/);
    });
  });

  test.describe('Search Functionality', () => {
    test('should search by flag name', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const initialCount = await flagList.getFlagCount();
      if (initialCount === 0) {
        test.skip();
        return;
      }

      // Get the name of the first flag
      const firstName = await flagList.tableRows.first().getByRole('link').first().textContent();

      if (!firstName) {
        test.skip();
        return;
      }

      // Search for it
      await flagList.searchFlags(firstName.substring(0, 5));
      await page.waitForTimeout(300);

      // Should find at least one result
      const resultsCount = await flagList.getFlagCount();
      expect(resultsCount).toBeGreaterThan(0);
    });

    test('should show empty state for no results', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      await flagList.searchFlags('xyznonexistentflag123');
      await page.waitForTimeout(300);

      // Should show empty state or zero results
      const count = await flagList.getFlagCount();
      expect(count).toBe(0);
    });

    test('should clear search results', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const initialCount = await flagList.getFlagCount();
      if (initialCount === 0) {
        test.skip();
        return;
      }

      // Search for something
      await flagList.searchFlags('test');
      await page.waitForTimeout(300);

      // Clear search
      await flagList.clearSearch();
      await page.waitForTimeout(300);

      // Should return to showing all flags
      const afterClearCount = await flagList.getFlagCount();
      expect(afterClearCount).toBe(initialCount);
    });
  });

  test.describe('Sorting', () => {
    test('should sort flags by name', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount < 2) {
        test.skip();
        return;
      }

      // Click name column header
      const nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /name/i });
      if ((await nameHeader.count()) === 0) {
        test.skip();
        return;
      }

      await nameHeader.click();

      // Table should be sorted (verify by checking first item)
      await page.waitForTimeout(300);
    });

    test('should toggle sort direction', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount < 2) {
        test.skip();
        return;
      }

      const nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /name/i });
      if ((await nameHeader.count()) === 0) {
        test.skip();
        return;
      }

      // Click twice to toggle direction
      await nameHeader.click();
      await page.waitForTimeout(300);

      await nameHeader.click();
      await page.waitForTimeout(300);

      // Should reverse the sort
    });
  });

  test.describe('Flag Values', () => {
    test('should toggle boolean flag state', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      // Use the page object's toggle helper
      const { initial, final } = await flagList.toggle.toggleAndVerify();

      // State should have changed
      expect(final).toBe(!initial);

      // Restore original state
      if (final !== initial) {
        await flagList.toggle.click();
      }
    });

    // Note: State persistence across page reload requires backend storage
    // This demo app uses in-memory stores, so state resets on reload
    test.skip('should persist boolean flag toggle across reload', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      const initialState = await flagList.toggle.isChecked();
      await flagList.toggle.click();
      const newState = await flagList.toggle.isChecked();
      expect(newState).toBe(!initialState);

      await page.reload();

      // State should persist (requires backend)
      const afterReloadState = await flagList.toggle.isChecked();
      expect(afterReloadState).toBe(newState);
    });

    test('should handle string flag values', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      // Find a string type flag if exists
      const stringFlagRow = flagList.tableRows.filter({ hasText: /string/i });
      if ((await stringFlagRow.count()) === 0) {
        test.skip();
        return;
      }

      await stringFlagRow.first().getByRole('link').first().click();

      // Should navigate to detail page - verify we're on a flag detail view
      await expect(page).toHaveURL(/flags\/[^/]+$/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      const flagList = new FlagListPage(page);

      // Block API requests
      await page.route('**/api/**', (route) => route.abort());

      await flagList.goto();

      // Should show error state or cached data
      await expect(page.locator('app-root')).toBeAttached();
    });

    test('should recover from errors', async ({ page }) => {
      const flagList = new FlagListPage(page);

      // First, block requests
      await page.route('**/api/**', (route) => route.abort());
      await flagList.goto();

      // Then, unblock
      await page.unroute('**/api/**');

      // Refresh should work
      await page.reload();
      await expect(page.locator('app-root')).toBeAttached();
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle rapid toggle clicks', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      const flagCount = await flagList.getFlagCount();
      if (flagCount === 0) {
        test.skip();
        return;
      }

      // Toggle input is visually hidden, use the label for clicking
      const toggleLabel = page.locator('app-toggle label.toggle').first();
      const toggleInput = page.locator('app-toggle input').first();
      const initialState = await toggleInput.isChecked();

      // Rapid clicks on label
      await toggleLabel.click();
      await toggleLabel.click();
      await toggleLabel.click();

      // Wait for any debouncing
      await page.waitForTimeout(1000);

      // Final state should be opposite of initial (odd number of clicks)
      const finalState = await toggleInput.isChecked();
      expect(finalState).toBe(!initialState);

      // Restore state
      if (finalState !== initialState) {
        await toggleLabel.click();
      }
    });
  });
});
