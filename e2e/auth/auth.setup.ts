import { test as setup } from '@playwright/test';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/');
  // Keycloak redirects to login page
  await page.waitForURL(/.*\/realms\/homelab\/protocol\/openid-connect\/.*/);
  await page.getByLabel('Username').fill(process.env['E2E_ADMIN_USERNAME']!);
  await page.locator('#password').fill(process.env['E2E_ADMIN_PASSWORD']!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Wait for redirect back to app
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/.*\/realms\/homelab\/protocol\/openid-connect\/.*/);
  await page.getByLabel('Username').fill(process.env['E2E_USER_USERNAME']!);
  await page.locator('#password').fill(process.env['E2E_USER_PASSWORD']!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
