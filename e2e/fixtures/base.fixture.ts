/**
 * Base test fixture for Feature Flag UI E2E tests
 *
 * @description Extends Playwright's base test with custom fixtures for
 * authentication, page objects, and common test utilities.
 *
 * Authentication is handled by Keycloak via storageState (set per project
 * in playwright.config.ts). No manual token injection is needed.
 */

import { test as base, expect, Page } from '@playwright/test';

/** Environment configuration */
export interface TestEnvironment {
  name: 'local' | 'staging' | 'production';
  baseUrl: string;
  apiUrl: string;
}

/** Get environment configuration from env vars */
function getEnvironment(): TestEnvironment {
  const envName = (process.env['E2E_ENV'] || 'local') as TestEnvironment['name'];
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
  const apiUrl = process.env['E2E_API_URL'] || 'http://localhost:3000/api';

  return { name: envName, baseUrl, apiUrl };
}

/** Custom fixtures for tests */
interface TestFixtures {
  /** Current test environment configuration */
  environment: TestEnvironment;

  /** Helper to wait for app to be ready */
  waitForApp: () => Promise<void>;

  /** Helper to navigate and wait for page load */
  navigateTo: (path: string) => Promise<void>;

  /** Helper to check if element exists without failing */
  elementExists: (selector: string) => Promise<boolean>;
}

/**
 * Extended test with custom fixtures
 *
 * @example
 * ```ts
 * import { test, expect } from '../fixtures/base.fixture';
 *
 * test('my test', async ({ page, environment, navigateTo }) => {
 *   await navigateTo('/flags');
 *   expect(environment.name).toBe('local');
 * });
 * ```
 */
export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  environment: async ({}, use) => {
    await use(getEnvironment());
  },

  waitForApp: async ({ page }, use) => {
    const waitForApp = async () => {
      await page.waitForSelector('app-root', { state: 'attached' });
      // Wait for Angular to stabilize (no pending HTTP requests, etc.)
      await page.waitForLoadState('networkidle');
    };
    await use(waitForApp);
  },

  navigateTo: async ({ page }, use) => {
    const navigateTo = async (path: string) => {
      await page.goto(path);
      await page.waitForSelector('app-root', { state: 'attached' });
      await page.waitForLoadState('domcontentloaded');
    };
    await use(navigateTo);
  },

  elementExists: async ({ page }, use) => {
    const elementExists = async (selector: string) => {
      try {
        await page.waitForSelector(selector, { timeout: 2000, state: 'attached' });
        return true;
      } catch {
        return false;
      }
    };
    await use(elementExists);
  },
});

export { expect };

/**
 * Common assertions for reuse across tests
 */
export const assertions = {
  /** Assert page has loaded successfully */
  async pageLoaded(page: Page) {
    await expect(page.locator('app-root')).toBeAttached();
  },

  /** Assert navigation is visible */
  async navigationVisible(page: Page) {
    await expect(page.getByRole('navigation')).toBeVisible();
  },

  /** Assert page title contains text */
  async titleContains(page: Page, text: string) {
    await expect(page).toHaveTitle(new RegExp(text, 'i'));
  },

  /** Assert URL matches pattern */
  async urlMatches(page: Page, pattern: string | RegExp) {
    await expect(page).toHaveURL(pattern);
  },

  /** Assert toast/notification appears */
  async toastAppears(page: Page, text: string | RegExp) {
    const toast = page.locator('[role="alert"], .toast, .notification');
    await expect(toast.filter({ hasText: text })).toBeVisible({ timeout: 5000 });
  },

  /** Assert empty state is shown */
  async emptyStateShown(page: Page) {
    await expect(page.locator('ui-empty-state, [data-testid="empty-state"]')).toBeVisible();
  },

  /** Assert loading spinner is not visible (page finished loading) */
  async notLoading(page: Page) {
    await expect(page.locator('.spinner, [data-testid="loading"]')).not.toBeVisible();
  },
};

/**
 * Common actions for reuse across tests
 */
export const actions = {
  /** Click a button by its accessible name */
  async clickButton(page: Page, name: string | RegExp) {
    await page.getByRole('button', { name }).click();
  },

  /** Fill a form field by its label */
  async fillField(page: Page, label: string, value: string) {
    await page.getByLabel(label).fill(value);
  },

  /** Select an option from a dropdown by label */
  async selectOption(page: Page, label: string, value: string) {
    await page.getByLabel(label).selectOption(value);
  },

  /** Toggle a switch/checkbox by its label */
  async toggle(page: Page, label: string) {
    await page.getByLabel(label).click();
  },

  /** Click a link by its text */
  async clickLink(page: Page, text: string | RegExp) {
    await page.getByRole('link', { name: text }).click();
  },

  /** Search using the search input */
  async search(page: Page, term: string) {
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchInput.fill(term);
  },

  /** Clear search */
  async clearSearch(page: Page) {
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchInput.clear();
  },

  /** Wait for navigation to complete */
  async waitForNavigation(page: Page, url: string | RegExp) {
    await page.waitForURL(url);
  },
};

/**
 * Test tags for categorizing tests
 * Use with test.describe or test() annotations
 */
export const tags = {
  smoke: '@smoke',
  regression: '@regression',
  critical: '@critical',
  slow: '@slow',
  flaky: '@flaky',
};
