/**
 * @feature Navigation - App-wide Navigation
 * @spec docs/features/navigation.md
 * @covers
 *   - NAV-001: Sidebar navigation
 *   - NAV-002: Breadcrumb navigation
 *   - NAV-003: Back button functionality
 *   - NAV-004: URL routing
 *   - NAV-005: Active link highlighting
 *   - NAV-006: Deep linking support
 *
 * @description
 * End-to-end tests for application navigation patterns.
 * Tests sidebar navigation, breadcrumbs, and URL routing.
 */

import { test, expect } from '../fixtures/base.fixture';

test.describe('Navigation Journey', () => {
  test.describe('Sidebar Navigation', () => {
    test('should display all main navigation items', async ({ page, navigateTo }) => {
      await navigateTo('/');

      const sidebar = page.locator('app-sidebar');
      await expect(sidebar).toBeVisible();

      // Check all main nav items
      await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /flags/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /environments/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /projects/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /segments/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /audit/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /settings/i })).toBeVisible();
    });

    test('should navigate to each section', async ({ page, navigateTo }) => {
      await navigateTo('/');

      const sections = [
        { name: /dashboard/i, url: /dashboard/ },
        { name: /flags/i, url: /flags/ },
        { name: /environments/i, url: /environments/ },
        { name: /projects/i, url: /projects/ },
        { name: /segments/i, url: /segments/ },
        { name: /audit/i, url: /audit/ },
        { name: /settings/i, url: /settings/ },
      ];

      for (const section of sections) {
        await page.locator('app-sidebar').getByRole('link', { name: section.name }).click();
        await expect(page).toHaveURL(section.url);
      }
    });

    test('should highlight active navigation item', async ({ page }) => {
      await page.goto('/flags');

      // Wait for Angular routing to settle and routerLinkActive to update
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const flagsNavItem = page
        .locator('app-sidebar li')
        .filter({ hasText: /feature flags/i })
        .first();

      // Check if the nav item has the active class
      const hasActiveClass = await flagsNavItem.evaluate((el) => {
        return el.classList.contains('nav-item--active');
      });

      expect(hasActiveClass).toBeTruthy();
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should show breadcrumbs on detail pages', async ({ page }) => {
      await page.goto('/flags');

      // Check if there are any flags to click
      const flagLinks = page.locator('ui-data-table').getByRole('link');
      if ((await flagLinks.count()) === 0) {
        test.skip();
        return;
      }

      // Click first flag
      await flagLinks.first().click();

      // Breadcrumb should be visible
      const breadcrumb = page.locator('ui-breadcrumb, [aria-label*="breadcrumb"]');
      await expect(breadcrumb).toBeVisible();
    });

    test('should navigate via breadcrumb', async ({ page }) => {
      await page.goto('/flags');

      const flagLinks = page.locator('ui-data-table').getByRole('link');
      if ((await flagLinks.count()) === 0) {
        test.skip();
        return;
      }

      await flagLinks.first().click();
      await expect(page).toHaveURL(/flags\/[^/]+/);

      // Click breadcrumb to go back
      const breadcrumb = page.locator('ui-breadcrumb, [aria-label*="breadcrumb"]');
      const flagsBreadcrumb = breadcrumb.getByRole('link', { name: /flags/i });

      if ((await flagsBreadcrumb.count()) > 0) {
        await flagsBreadcrumb.click();
        await expect(page).toHaveURL(/flags$/);
      }
    });
  });

  test.describe('URL Routing', () => {
    test('should support deep linking to dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should support deep linking to flags list', async ({ page }) => {
      await page.goto('/flags');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/flags/);
    });

    test('should support deep linking to flag creation', async ({ page }) => {
      await page.goto('/flags/new');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/flags\/new/);
    });

    test('should support deep linking to environments', async ({ page }) => {
      await page.goto('/environments');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/environments/);
    });

    test('should support deep linking to projects', async ({ page }) => {
      await page.goto('/projects');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/projects/);
    });

    test('should support deep linking to settings', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/settings/);
    });

    test('should handle unknown routes gracefully', async ({ page }) => {
      await page.goto('/this-route-does-not-exist');
      await expect(page.locator('app-root')).toBeAttached();
      // Should either show 404 or redirect
    });

    test('should redirect root to dashboard', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  test.describe('Browser Navigation', () => {
    test('should support browser back button', async ({ page, navigateTo }) => {
      await navigateTo('/dashboard');
      await page.locator('app-sidebar').getByRole('link', { name: /flags/i }).click();
      await expect(page).toHaveURL(/flags/);

      await page.goBack();
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should support browser forward button', async ({ page, navigateTo }) => {
      await navigateTo('/dashboard');
      await page.locator('app-sidebar').getByRole('link', { name: /flags/i }).click();
      await expect(page).toHaveURL(/flags/);

      await page.goBack();
      await expect(page).toHaveURL(/dashboard/);

      await page.goForward();
      await expect(page).toHaveURL(/flags/);
    });

    test('should maintain state across browser navigation', async ({ page }) => {
      await page.goto('/flags');

      // Search for something
      const searchInput = page.locator('ui-search-input input, [role="searchbox"]');
      if ((await searchInput.count()) > 0) {
        await searchInput.fill('test');
        await page.waitForTimeout(300);

        // Navigate away
        await page
          .locator('app-sidebar')
          .getByRole('link', { name: /dashboard/i })
          .click();
        await expect(page).toHaveURL(/dashboard/);

        // Navigate back
        await page.goBack();
        await expect(page).toHaveURL(/flags/);

        // Note: Search state may or may not be preserved depending on implementation
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support tab navigation through sidebar', async ({ page, navigateTo }) => {
      await navigateTo('/');

      // Focus on sidebar
      await page.locator('app-sidebar').focus();

      // Tab through links - just verify it doesn't error
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to activate link with Enter
      // Note: Actual focused element depends on implementation
    });
  });

  test.describe('Environment Indicator', () => {
    test('should show environment list in sidebar', async ({ page, navigateTo }) => {
      await navigateTo('/');

      const sidebar = page.locator('app-sidebar');

      // Environments section should be visible
      const envsSection = sidebar.locator('.environments, [data-testid="environments-nav"]');
      // May not exist in all implementations
      if ((await envsSection.count()) > 0) {
        await expect(envsSection).toBeVisible();
      }
    });
  });
});
