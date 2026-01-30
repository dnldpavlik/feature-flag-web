/**
 * Test Utilities
 *
 * Common utility functions for E2E tests.
 */

import { test } from '@playwright/test';

/**
 * Skip test if count is below minimum
 * Use this for tests that require existing data
 *
 * @example
 * const flagCount = await flagList.getFlagCount();
 * if (skipIfEmpty(flagCount)) return;
 */
export function skipIfEmpty(count: number, minimum = 1): boolean {
  if (count < minimum) {
    test.skip();
    return true;
  }
  return false;
}

/**
 * Skip test if element doesn't exist
 *
 * @example
 * const editButton = page.locator('.edit-btn');
 * if (await skipIfNotFound(editButton)) return;
 */
export async function skipIfNotFound(locator: { count: () => Promise<number> }): Promise<boolean> {
  const count = await locator.count();
  if (count === 0) {
    test.skip();
    return true;
  }
  return false;
}

/**
 * Generate a unique ID for test data
 * Combines timestamp with random string for uniqueness
 */
export function uniqueTestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `test-${timestamp}-${random}`;
}

/**
 * Create unique test data with prefix
 *
 * @example
 * const data = createTestData('Flag');
 * // { name: 'Flag test-1234567890-abc12', key: 'flag-test-1234567890-abc12' }
 */
export function createTestData(prefix: string): { name: string; key: string } {
  const id = uniqueTestId();
  return {
    name: `${prefix} ${id}`,
    key: `${prefix.toLowerCase()}-${id}`,
  };
}
