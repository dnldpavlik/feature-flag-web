import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Environment Variables:
 * - E2E_BASE_URL: Base URL for tests (default: http://localhost:4200)
 * - E2E_ENV: Target environment (local, staging, production)
 * - CI: Set automatically in CI environments
 * - E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD: Keycloak admin credentials
 * - E2E_USER_USERNAME / E2E_USER_PASSWORD: Keycloak regular user credentials
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
    // Auth setup — runs first, no storageState
    {
      name: 'auth-setup',
      testMatch: /auth\/.*\.setup\.ts/,
    },

    // Smoke tests - run first, fast verification
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // User journey tests - core workflows
    {
      name: 'journeys',
      testMatch: /journeys\/(?!role-).*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // User role tests - non-admin flows
    {
      name: 'user-role',
      testMatch: /journeys\/role-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    // Full regression - comprehensive testing
    {
      name: 'regression',
      testMatch: /regression\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // Cross-browser testing (regression only)
    {
      name: 'firefox',
      testMatch: /regression\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'webkit',
      testMatch: /regression\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // Mobile viewport testing
    {
      name: 'mobile-chrome',
      testMatch: /regression\/responsive\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'mobile-safari',
      testMatch: /regression\/responsive\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
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
