import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Environment Variables:
 * - E2E_BASE_URL: Base URL for tests (default: http://localhost:4200)
 * - E2E_ENV: Target environment (local, staging, production)
 * - CI: Set automatically in CI environments
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const baseURL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
const isCI = !!process.env['CI'];
const targetEnv = process.env['E2E_ENV'] || 'local';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(isCI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Smoke tests - run first, fast verification
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // User journey tests - core workflows
    {
      name: 'journeys',
      testMatch: /journeys\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Full regression - comprehensive testing
    {
      name: 'regression',
      testMatch: /regression\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Cross-browser testing (regression only)
    {
      name: 'firefox',
      testMatch: /regression\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /regression\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewport testing
    {
      name: 'mobile-chrome',
      testMatch: /regression\/responsive\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      testMatch: /regression\/responsive\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before starting tests (only for local environment)
  ...(targetEnv === 'local'
    ? {
        webServer: {
          command: 'npm run start',
          url: 'http://localhost:4200',
          reuseExistingServer: !isCI,
          timeout: 120 * 1000,
        },
      }
    : {}),
});
