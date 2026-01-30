/**
 * Mock Factories
 *
 * Factory functions for creating test data objects.
 * Use these to create consistent test fixtures across tests.
 */

/**
 * Generate a unique ID with optional prefix
 */
export function mockId(prefix = 'test'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a timestamp
 */
export function mockTimestamp(): Date {
  return new Date();
}

/**
 * Base mock item with common fields
 */
export interface MockItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a base mock item with timestamps
 */
export function createMockItem(prefix = 'item'): MockItem {
  const now = mockTimestamp();
  return {
    id: mockId(prefix),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Flag mock factory
 */
export interface MockFlag extends MockItem {
  projectId: string;
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: boolean | string | number | object;
  tags: string[];
  environmentValues: Record<string, { enabled: boolean; value: unknown }>;
}

export function createMockFlag(overrides: Partial<MockFlag> = {}): MockFlag {
  const base = createMockItem('flag');
  return {
    ...base,
    projectId: 'proj_default',
    key: `test-flag-${base.id}`,
    name: 'Test Flag',
    description: 'A test flag for unit tests',
    type: 'boolean',
    defaultValue: false,
    tags: [],
    environmentValues: {
      env_development: { enabled: false, value: false },
      env_staging: { enabled: false, value: false },
      env_production: { enabled: false, value: false },
    },
    ...overrides,
  };
}

/**
 * Project mock factory
 */
export interface MockProject extends MockItem {
  key: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export function createMockProject(overrides: Partial<MockProject> = {}): MockProject {
  const base = createMockItem('proj');
  return {
    ...base,
    key: `test-project-${base.id}`,
    name: 'Test Project',
    description: 'A test project for unit tests',
    isDefault: false,
    ...overrides,
  };
}

/**
 * Environment mock factory
 */
export interface MockEnvironment extends MockItem {
  key: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export function createMockEnvironment(overrides: Partial<MockEnvironment> = {}): MockEnvironment {
  const base = createMockItem('env');
  return {
    ...base,
    key: `test-env-${base.id}`,
    name: 'Test Environment',
    color: '#808080',
    order: 99,
    isDefault: false,
    ...overrides,
  };
}

/**
 * Segment mock factory
 */
export interface MockSegment extends MockItem {
  key: string;
  name: string;
  description: string;
  rules: MockSegmentRule[];
}

export interface MockSegmentRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

export function createMockSegmentRule(overrides: Partial<MockSegmentRule> = {}): MockSegmentRule {
  return {
    id: mockId('rule'),
    attribute: 'email',
    operator: 'contains',
    value: '@test.com',
    ...overrides,
  };
}

export function createMockSegment(overrides: Partial<MockSegment> = {}): MockSegment {
  const base = createMockItem('seg');
  return {
    ...base,
    key: `test-segment-${base.id}`,
    name: 'Test Segment',
    description: 'A test segment for unit tests',
    rules: [createMockSegmentRule()],
    ...overrides,
  };
}

/**
 * Audit log mock factory
 */
export interface MockAuditLog extends MockItem {
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  details: Record<string, unknown>;
}

export function createMockAuditLog(overrides: Partial<MockAuditLog> = {}): MockAuditLog {
  const base = createMockItem('audit');
  return {
    ...base,
    action: 'created',
    entityType: 'flag',
    entityId: mockId('flag'),
    entityName: 'Test Flag',
    userId: mockId('user'),
    userName: 'Test User',
    details: {},
    ...overrides,
  };
}

/**
 * API Key mock factory
 */
export interface MockApiKey extends MockItem {
  name: string;
  key: string;
  environmentId: string;
  lastUsed: Date | null;
}

export function createMockApiKey(overrides: Partial<MockApiKey> = {}): MockApiKey {
  const base = createMockItem('key');
  return {
    ...base,
    name: 'Test API Key',
    key: `sk_test_${Math.random().toString(36).substring(2, 15)}`,
    environmentId: 'env_development',
    lastUsed: null,
    ...overrides,
  };
}

/**
 * Create multiple mock items
 */
export function createMockList<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, factory);
}
