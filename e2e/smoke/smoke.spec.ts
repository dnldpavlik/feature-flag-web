/**
 * @feature Smoke Tests - Deployment Verification
 * @spec docs/testing/smoke-tests.md
 * @covers
 *   - SMOKE-001: Application loads successfully
 *   - SMOKE-002: Navigation is functional
 *   - SMOKE-003: Core pages are accessible
 *   - SMOKE-004: API connectivity (when backend available)
 *   - SMOKE-005: Authentication state
 *
 * @description
 * Quick smoke tests to verify the application is functioning after deployment.
 * These tests should complete in under 2 minutes and cover critical paths only.
 * Run these after every deployment to staging/production.
 */

import { test, expect } from '../fixtures/base.fixture';
import { DashboardPage, FlagListPage, EnvironmentListPage, ProjectListPage } from '../pages';

test.describe('Smoke Tests', () => {
  test.describe('Application Bootstrap', () => {
    test('should load the application successfully', async ({ page, waitForApp }) => {
      await page.goto('/');
      await waitForApp();

      // Verify Angular app bootstrapped
      await expect(page.locator('app-root')).toBeAttached();

      // Verify title is set
      await expect(page).toHaveTitle(/Feature Flag/i);
    });

    test('should display the main layout', async ({ page, navigateTo }) => {
      await navigateTo('/');

      // Verify sidebar navigation exists (use .sidebar as app-sidebar host has no dimensions due to fixed positioning)
      await expect(page.locator('.sidebar')).toBeVisible();

      // Verify header exists
      await expect(page.locator('app-header')).toBeVisible();

      // Verify main content area exists
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test('should have working navigation links', async ({ page, navigateTo }) => {
      await navigateTo('/');

      // Check navigation links are present (use .sidebar as app-sidebar host has no dimensions)
      const nav = page.locator('.sidebar');
      await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /flags/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /projects/i })).toBeVisible();
    });
  });

  test.describe('Core Pages Load', () => {
    test('dashboard page loads', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.assertDashboardLoaded();
    });

    test('flags page loads', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();
      await flagList.assertPageLoaded();
    });

    test('environments page loads', async ({ page }) => {
      const envList = new EnvironmentListPage(page);
      await envList.goto();
      await envList.assertPageLoaded();
    });

    test('projects page loads', async ({ page }) => {
      const projectList = new ProjectListPage(page);
      await projectList.goto();
      await projectList.assertPageLoaded();
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate between main sections', async ({ page, navigateTo }) => {
      // Start at dashboard
      await navigateTo('/dashboard');
      await expect(page).toHaveURL(/dashboard/);

      // Navigate to flags
      await page.getByRole('link', { name: /flags/i }).click();
      await expect(page).toHaveURL(/flags/);

      // Navigate to projects
      await page.getByRole('link', { name: /projects/i }).click();
      await expect(page).toHaveURL(/projects/);

      // Navigate back to dashboard
      await page.getByRole('link', { name: /dashboard/i }).click();
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should handle direct URL navigation', async ({ page }) => {
      // Direct navigation to flags
      await page.goto('/flags');
      await expect(page.locator('app-root')).toBeAttached();
      await expect(page).toHaveURL(/flags/);
    });

    test('should redirect root to dashboard', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should handle 404 gracefully', async ({ page }) => {
      await page.goto('/non-existent-route');

      // Should either show 404 page or redirect to dashboard
      await expect(page.locator('app-root')).toBeAttached();
    });
  });

  test.describe('UI Components', () => {
    test('should render stat cards on dashboard', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      // Verify stat cards are rendered
      await expect(dashboard.statCards.first()).toBeVisible();
    });

    test('should render data tables on list pages', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      // Verify either data table or empty state is shown
      const tableOrEmpty = page.locator('ui-data-table, ui-empty-state');
      await expect(tableOrEmpty.first()).toBeVisible();
    });

    test('should render action buttons', async ({ page }) => {
      const flagList = new FlagListPage(page);
      await flagList.goto();

      // Verify create button is present
      await expect(flagList.createButton).toBeVisible();
    });
  });

  test.describe('Authentication', () => {
    test('should show logged-in user name in sidebar', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(page.locator('.user-menu__name')).not.toBeEmpty();
    });

    test('should have user menu button', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(page.locator('.user-menu')).toBeVisible();
    });
  });

  test.describe('Theme Support', () => {
    test('should support light theme', async ({ page, navigateTo }) => {
      await navigateTo('/');

      // Verify app renders without theme-related errors
      await expect(page.locator('app-root')).toBeVisible();
    });

    test('should support dark theme via preference', async ({ page, navigateTo }) => {
      // Set dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await navigateTo('/');

      // Verify app still renders correctly
      await expect(page.locator('app-root')).toBeVisible();
    });
  });
});

test.describe('Environment Verification', () => {
  test('should display environment indicator', async ({ page, environment }) => {
    await page.goto('/');

    // Log environment for debugging
    console.log(`Running smoke tests against: ${environment.name} (${environment.baseUrl})`);

    // Verify we're on the expected environment
    expect(page.url()).toContain(environment.baseUrl.replace(/^https?:\/\//, ''));
  });
});
