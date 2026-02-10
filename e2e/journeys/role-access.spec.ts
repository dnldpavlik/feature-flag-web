/**
 * @feature Role-Based Access Control
 * @description Tests that non-admin users are redirected from admin-only routes
 * and that admin nav items are hidden.
 *
 * This spec uses the 'user-role' project which authenticates with a non-admin account.
 */

import { test, expect } from '../fixtures/base.fixture';

test.describe('Role-based access', () => {
  test('user cannot access settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('user cannot access environments page', async ({ page }) => {
    await page.goto('/environments');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('user can access flags page', async ({ page }) => {
    await page.goto('/flags');
    await expect(page).toHaveURL(/.*\/flags/);
  });

  test('admin nav items are hidden for user role', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('app-nav-item').filter({ hasText: 'Settings' })).not.toBeVisible();
    await expect(
      page.locator('app-nav-item').filter({ hasText: 'Environments' }),
    ).not.toBeVisible();
  });
});
