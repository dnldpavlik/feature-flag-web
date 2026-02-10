/**
 * Test data constants and factories for E2E tests
 *
 * @description Provides consistent test data across all test suites.
 * Uses timestamps to ensure unique identifiers in parallel test runs.
 */

/** Generate a unique identifier for test data */
export const uniqueId = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Test data for feature flags */
export const testFlags = {
  boolean: {
    name: () => `Boolean Flag ${uniqueId()}`,
    key: () => `boolean-flag-${uniqueId()}`,
    description: 'A test boolean feature flag',
    type: 'boolean' as const,
  },
  string: {
    name: () => `String Flag ${uniqueId()}`,
    key: () => `string-flag-${uniqueId()}`,
    description: 'A test string feature flag',
    type: 'string' as const,
  },
  number: {
    name: () => `Number Flag ${uniqueId()}`,
    key: () => `number-flag-${uniqueId()}`,
    description: 'A test number feature flag',
    type: 'number' as const,
  },
  json: {
    name: () => `JSON Flag ${uniqueId()}`,
    key: () => `json-flag-${uniqueId()}`,
    description: 'A test JSON feature flag',
    type: 'json' as const,
  },
};

/** Test data for environments */
export const testEnvironments = {
  development: {
    name: () => `Development ${uniqueId()}`,
    key: () => `dev-${uniqueId()}`,
    color: '#22c55e',
  },
  staging: {
    name: () => `Staging ${uniqueId()}`,
    key: () => `staging-${uniqueId()}`,
    color: '#f59e0b',
  },
  production: {
    name: () => `Production ${uniqueId()}`,
    key: () => `prod-${uniqueId()}`,
    color: '#ef4444',
  },
};

/** Test data for projects */
export const testProjects = {
  default: {
    name: () => `Test Project ${uniqueId()}`,
    key: () => `test-project-${uniqueId()}`,
    description: 'A test project for E2E testing',
  },
};

/** Test data for segments */
export const testSegments = {
  betaUsers: {
    name: () => `Beta Users ${uniqueId()}`,
    key: () => `beta-users-${uniqueId()}`,
    description: 'Users in the beta program',
  },
  premiumUsers: {
    name: () => `Premium Users ${uniqueId()}`,
    key: () => `premium-users-${uniqueId()}`,
    description: 'Users with premium subscriptions',
  },
};

/** Test user credentials — provided via environment variables */
export const testUsers = {
  admin: {
    username: process.env['E2E_ADMIN_USERNAME'] || 'test-admin',
    password: process.env['E2E_ADMIN_PASSWORD'] || '',
  },
  user: {
    username: process.env['E2E_USER_USERNAME'] || 'test-user',
    password: process.env['E2E_USER_PASSWORD'] || '',
  },
};

/** Well-known test data that should exist in seeded environments */
export const seededData = {
  project: {
    id: 'default-project',
    key: 'default',
    name: 'Default Project',
  },
  environments: {
    development: { id: 'env-dev', key: 'development', name: 'Development' },
    staging: { id: 'env-staging', key: 'staging', name: 'Staging' },
    production: { id: 'env-prod', key: 'production', name: 'Production' },
  },
};
