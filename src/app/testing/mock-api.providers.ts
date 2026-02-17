/**
 * Mock API Service Providers for Testing
 *
 * Provides mock API services for tests that use stores depending on API services.
 * Import `MOCK_API_PROVIDERS` and spread it into your TestBed providers.
 *
 * @example
 * ```typescript
 * TestBed.configureTestingModule({
 *   providers: [ProjectStore, ...MOCK_API_PROVIDERS],
 * });
 * ```
 */

import { Provider, signal } from '@angular/core';
import { of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { ProjectApi } from '@/app/features/projects/api/project.api';
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/app/features/projects/models/project.model';
import { EnvironmentApi } from '@/app/features/environments/api/environment.api';
import {
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from '@/app/features/environments/models/environment.model';
import {
  FlagApi,
  UpdateFlagInput,
  UpdateEnvironmentValueInput,
} from '@/app/features/flags/api/flag.api';
import { Flag, CreateFlagInput } from '@/app/features/flags/models/flag.model';
import { EnvironmentFlagValue, FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import { SegmentApi, UpdateSegmentInput } from '@/app/features/segments/api/segment.api';
import { Segment, CreateSegmentInput } from '@/app/features/segments/models/segment.model';
import {
  CreateSegmentRuleInput,
  SegmentRule,
  UpdateSegmentRuleInput,
} from '@/app/features/segments/models/segment-rule.model';
import { AuditApi } from '@/app/features/audit/api/audit.api';
import { AuditEntry, LogActionInput } from '@/app/features/audit/models/audit.model';
import { ApiKeyApi } from '@/app/features/settings/api/api-key.api';
import {
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResult,
} from '@/app/features/settings/models/settings.model';

const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';
let mockIdCounter = 1000;

/** Creates seed environment value with fixed timestamps */
function createSeedEnvValue<T>(
  flagId: string,
  environmentId: string,
  value: T,
  enabled: boolean,
): EnvironmentFlagValue {
  return {
    flagId,
    environmentId,
    value: value as FlagTypeMap[keyof FlagTypeMap],
    enabled,
    segmentKeys: [],
    updatedAt: SEED_TIMESTAMP,
  };
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_default',
    key: 'default',
    name: 'Default Project',
    description: 'Primary feature flag workspace.',
    isDefault: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'proj_growth',
    key: 'growth',
    name: 'Growth Experiments',
    description: 'Revenue, onboarding, and conversion tests.',
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

export const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: 'env_development',
    key: 'development',
    name: 'Development',
    color: '#10B981',
    order: 0,
    isDefault: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'env_staging',
    key: 'staging',
    name: 'Staging',
    color: '#F59E0B',
    order: 1,
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'env_production',
    key: 'production',
    name: 'Production',
    color: '#EF4444',
    order: 2,
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

export const MOCK_FLAGS: Flag[] = [
  {
    id: 'flag_new_checkout',
    projectId: 'proj_default',
    key: 'new-checkout',
    name: 'New Checkout Experience',
    description: 'Roll out the updated checkout flow by cohort.',
    type: 'boolean',
    defaultValue: false,
    tags: ['checkout', 'web'],
    environmentValues: {
      env_development: createSeedEnvValue('flag_new_checkout', 'env_development', true, true),
      env_staging: createSeedEnvValue('flag_new_checkout', 'env_staging', true, true),
      env_production: createSeedEnvValue('flag_new_checkout', 'env_production', false, false),
    },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'flag_pricing_banner',
    projectId: 'proj_default',
    key: 'pricing-banner',
    name: 'Pricing Banner',
    description: 'Show the new pricing CTA on marketing pages.',
    type: 'boolean',
    defaultValue: false,
    tags: ['marketing'],
    environmentValues: {
      env_development: createSeedEnvValue('flag_pricing_banner', 'env_development', true, true),
      env_staging: createSeedEnvValue('flag_pricing_banner', 'env_staging', false, false),
      env_production: createSeedEnvValue('flag_pricing_banner', 'env_production', false, false),
    },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'flag_beta_theme',
    projectId: 'proj_default',
    key: 'beta-theme',
    name: 'Beta Theme Palette',
    description: 'Preview the new theme tokens in select orgs.',
    type: 'string',
    defaultValue: 'default',
    tags: ['design', 'beta'],
    environmentValues: {
      env_development: createSeedEnvValue('flag_beta_theme', 'env_development', 'dark', true),
      env_staging: createSeedEnvValue('flag_beta_theme', 'env_staging', 'light', true),
      env_production: createSeedEnvValue('flag_beta_theme', 'env_production', 'default', false),
    },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'flag_search_boost',
    projectId: 'proj_growth',
    key: 'search-boost',
    name: 'Search Boost Weighting',
    description: 'Tune search relevance weighting for enterprise.',
    type: 'number',
    defaultValue: 1.0,
    tags: ['search', 'enterprise'],
    environmentValues: {
      env_development: createSeedEnvValue('flag_search_boost', 'env_development', 1.5, true),
      env_staging: createSeedEnvValue('flag_search_boost', 'env_staging', 1.2, false),
      env_production: createSeedEnvValue('flag_search_boost', 'env_production', 1.0, false),
    },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'flag_checkout_guardrails',
    projectId: 'proj_growth',
    key: 'checkout-guardrails',
    name: 'Checkout Guardrails',
    description: 'Ship guardrail config for risky payment methods.',
    type: 'json',
    defaultValue: { maxAmount: 1000, requireVerification: false },
    tags: ['risk', 'payments'],
    environmentValues: {
      env_development: createSeedEnvValue(
        'flag_checkout_guardrails',
        'env_development',
        { maxAmount: 10000, requireVerification: false },
        true,
      ),
      env_staging: createSeedEnvValue(
        'flag_checkout_guardrails',
        'env_staging',
        { maxAmount: 5000, requireVerification: true },
        true,
      ),
      env_production: createSeedEnvValue(
        'flag_checkout_guardrails',
        'env_production',
        { maxAmount: 1000, requireVerification: true },
        true,
      ),
    },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

const MOCK_PROJECT_API: Partial<ProjectApi> = {
  getAll: () => of(MOCK_PROJECTS),
  getById: (id: string) => of(MOCK_PROJECTS.find((p) => p.id === id) as Project),
  create: (input: CreateProjectInput) =>
    of({
      id: `proj_${mockIdCounter++}`,
      ...input,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (id: string, updates: UpdateProjectInput) => {
    const existing = MOCK_PROJECTS.find((p) => p.id === id);
    return of({ ...existing!, ...updates, updatedAt: new Date().toISOString() });
  },
  delete: () => of(undefined),
  setDefault: (id: string) => of(MOCK_PROJECTS.find((p) => p.id === id) as Project),
};

const MOCK_ENVIRONMENT_API: Partial<EnvironmentApi> = {
  getAll: () => of(MOCK_ENVIRONMENTS),
  getById: (id: string) => of(MOCK_ENVIRONMENTS.find((e) => e.id === id) as Environment),
  create: (input: CreateEnvironmentInput) =>
    of({
      id: `env_${mockIdCounter++}`,
      key: input.key,
      name: input.name,
      color: input.color,
      order: input.order,
      isDefault: input.isDefault ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (id: string, updates: UpdateEnvironmentInput) => {
    const existing = MOCK_ENVIRONMENTS.find((e) => e.id === id);
    return of({ ...existing!, ...updates, updatedAt: new Date().toISOString() });
  },
  delete: () => of(undefined),
  setDefault: (id: string) => of(MOCK_ENVIRONMENTS.find((e) => e.id === id) as Environment),
};

const MOCK_FLAG_API: Partial<FlagApi> = {
  getAll: () => of(MOCK_FLAGS),
  getById: (id: string) => of(MOCK_FLAGS.find((f) => f.id === id) as Flag),
  getByKey: (key: string) => of(MOCK_FLAGS.find((f) => f.key === key) as Flag),
  create: (input: CreateFlagInput) => {
    const flagId = `flag_${mockIdCounter++}`;
    const environmentValues: Record<string, EnvironmentFlagValue> = {};
    for (const env of MOCK_ENVIRONMENTS) {
      environmentValues[env.id] = {
        environmentId: env.id,
        flagId,
        value: input.defaultValue,
        enabled: false,
        segmentKeys: [],
        updatedAt: new Date().toISOString(),
      };
    }
    return of({
      id: flagId,
      projectId: input.projectId,
      key: input.key,
      name: input.name,
      description: input.description,
      type: input.type,
      defaultValue: input.defaultValue,
      tags: input.tags,
      environmentValues,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  update: (id: string, updates: UpdateFlagInput) => {
    const existing = MOCK_FLAGS.find((f) => f.id === id);
    return of({ ...existing!, ...updates, updatedAt: new Date().toISOString() });
  },
  delete: () => of(undefined),
  updateEnvironmentValue: (
    flagId: string,
    environmentId: string,
    updates: UpdateEnvironmentValueInput,
  ) => {
    const existing = MOCK_FLAGS.find((f) => f.id === flagId);
    if (!existing) {
      return of(existing as unknown as Flag);
    }
    const existingEnvValue = existing.environmentValues[environmentId];
    return of({
      ...existing,
      environmentValues: {
        ...existing.environmentValues,
        [environmentId]: {
          ...existingEnvValue,
          environmentId,
          flagId,
          value: updates.value ?? existingEnvValue?.value ?? existing.defaultValue,
          enabled: updates.enabled ?? existingEnvValue?.enabled ?? false,
          segmentKeys: existingEnvValue?.segmentKeys ?? [],
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    });
  },
};

export const MOCK_SEGMENTS: Segment[] = [
  {
    id: 'seg_beta',
    key: 'beta-testers',
    name: 'Beta Testers',
    description: 'Internal and external testers for early feature access.',
    ruleCount: 2,
    rules: [
      {
        id: 'rule_beta1',
        attribute: 'email',
        operator: 'contains',
        value: '@company.com',
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
      {
        id: 'rule_beta2',
        attribute: 'plan',
        operator: 'in',
        value: ['beta', 'early-access'],
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
    ],
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'seg_internal',
    key: 'internal-users',
    name: 'Internal Users',
    description: 'Employees and trusted partners.',
    ruleCount: 1,
    rules: [
      {
        id: 'rule_int1',
        attribute: 'email',
        operator: 'ends_with',
        value: '@internal.corp',
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
    ],
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

const MOCK_SEGMENT_API: Partial<SegmentApi> = {
  getAll: () => of(MOCK_SEGMENTS),
  getById: (id: string) => of(MOCK_SEGMENTS.find((s) => s.id === id) as Segment),
  create: (input: CreateSegmentInput) =>
    of({
      id: `seg_${mockIdCounter++}`,
      key: input.key,
      name: input.name,
      description: input.description,
      ruleCount: 0,
      rules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (id: string, updates: UpdateSegmentInput) => {
    const existing = MOCK_SEGMENTS.find((s) => s.id === id);
    return of({ ...existing!, ...updates, updatedAt: new Date().toISOString() });
  },
  delete: () => of(undefined),
  addRule: (segmentId: string, input: CreateSegmentRuleInput) => {
    const existing = MOCK_SEGMENTS.find((s) => s.id === segmentId);
    const newRule: SegmentRule = {
      id: `rule_${mockIdCounter++}`,
      attribute: input.attribute,
      operator: input.operator,
      value: input.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of({
      ...existing!,
      rules: [...existing!.rules, newRule],
      ruleCount: existing!.ruleCount + 1,
      updatedAt: new Date().toISOString(),
    });
  },
  updateRule: (segmentId: string, ruleId: string, updates: UpdateSegmentRuleInput) => {
    const existing = MOCK_SEGMENTS.find((s) => s.id === segmentId);
    return of({
      ...existing!,
      rules: existing!.rules.map((r) =>
        r.id === ruleId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r,
      ),
      updatedAt: new Date().toISOString(),
    });
  },
  deleteRule: (segmentId: string, ruleId: string) => {
    const existing = MOCK_SEGMENTS.find((s) => s.id === segmentId);
    return of({
      ...existing!,
      rules: existing!.rules.filter((r) => r.id !== ruleId),
      ruleCount: existing!.ruleCount - 1,
      updatedAt: new Date().toISOString(),
    });
  },
};

export const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'audit_001',
    action: 'created',
    resourceType: 'flag',
    resourceId: 'flag_darkmode',
    resourceName: 'Dark Mode',
    details: 'Created boolean flag with default value false',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-25T10:30:00.000Z',
  },
  {
    id: 'audit_002',
    action: 'toggled',
    resourceType: 'flag',
    resourceId: 'flag_newcheckout',
    resourceName: 'New Checkout Flow',
    details: 'Enabled flag in production environment',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-25T09:15:00.000Z',
  },
  {
    id: 'audit_003',
    action: 'updated',
    resourceType: 'segment',
    resourceId: 'seg_betausers',
    resourceName: 'Beta Users',
    details: 'Added 50 users to segment',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-24T16:45:00.000Z',
  },
  {
    id: 'audit_004',
    action: 'created',
    resourceType: 'environment',
    resourceId: 'env_staging',
    resourceName: 'Staging',
    details: 'Created new staging environment',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-24T14:00:00.000Z',
  },
  {
    id: 'audit_005',
    action: 'updated',
    resourceType: 'project',
    resourceId: 'proj_main',
    resourceName: 'Main Project',
    details: 'Updated project description and tags',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-24T11:30:00.000Z',
  },
  {
    id: 'audit_006',
    action: 'deleted',
    resourceType: 'flag',
    resourceId: 'flag_oldfeature',
    resourceName: 'Old Feature Toggle',
    details: 'Removed deprecated feature flag',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-23T17:20:00.000Z',
  },
  {
    id: 'audit_007',
    action: 'toggled',
    resourceType: 'flag',
    resourceId: 'flag_maintenance',
    resourceName: 'Maintenance Mode',
    details: 'Disabled maintenance mode in all environments',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-23T08:00:00.000Z',
  },
  {
    id: 'audit_008',
    action: 'created',
    resourceType: 'segment',
    resourceId: 'seg_enterprise',
    resourceName: 'Enterprise Customers',
    details: 'Created segment for enterprise tier users',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-22T15:30:00.000Z',
  },
  {
    id: 'audit_009',
    action: 'updated',
    resourceType: 'flag',
    resourceId: 'flag_darkmode',
    resourceName: 'Dark Mode',
    details: 'Changed targeting rules to include beta users',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-22T10:15:00.000Z',
  },
  {
    id: 'audit_010',
    action: 'deleted',
    resourceType: 'segment',
    resourceId: 'seg_testusers',
    resourceName: 'Test Users',
    details: 'Removed unused test segment',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-21T14:45:00.000Z',
  },
];

const MOCK_AUDIT_API: Partial<AuditApi> = {
  getAll: () => of(MOCK_AUDIT_ENTRIES),
  create: (input: LogActionInput) =>
    of({
      id: `audit_${mockIdCounter++}`,
      ...input,
      timestamp: new Date().toISOString(),
    }),
};

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Production SDK Key',
    prefix: 'sk_live_abc1...xyz9',
    lastUsedAt: '2025-01-15T10:30:00.000Z',
    createdAt: SEED_TIMESTAMP,
    expiresAt: null,
    scopes: ['read:flags'],
  },
  {
    id: 'key_2',
    name: 'CI/CD Pipeline Key',
    prefix: 'sk_live_def2...uvw8',
    lastUsedAt: null,
    createdAt: '2025-01-10T00:00:00.000Z',
    expiresAt: '2025-12-31T23:59:59Z',
    scopes: ['read:flags', 'write:flags'],
  },
];

const MOCK_API_KEY_API: Partial<ApiKeyApi> = {
  getAll: () => of(MOCK_API_KEYS),
  create: (input: CreateApiKeyInput) => {
    const keyId = `key_${mockIdCounter++}`;
    const secretBase = 'abcdef123456789xyz';
    const newKey: ApiKey = {
      id: keyId,
      name: input.name,
      prefix: `sk_live_${secretBase.slice(0, 4)}...${secretBase.slice(-4)}`,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt ?? null,
      scopes: input.scopes,
    };
    return of({
      key: newKey,
      secret: `sk_live_${secretBase}`,
    } as CreateApiKeyResult);
  },
  revoke: () => of(undefined),
};

const MOCK_KEYCLOAK: Partial<Keycloak> = {
  authenticated: true,
  token: 'mock-token',
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  loadUserProfile: jest.fn().mockResolvedValue({
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  }),
  resourceAccess: { 'feature-flags-ui': { roles: ['admin'] } },
  realmAccess: { roles: [] },
};

const MOCK_KEYCLOAK_EVENT_SIGNAL = signal({
  type: KeycloakEventType.Ready,
  args: true,
});

export const MOCK_API_PROVIDERS: Provider[] = [
  { provide: ProjectApi, useValue: MOCK_PROJECT_API },
  { provide: EnvironmentApi, useValue: MOCK_ENVIRONMENT_API },
  { provide: FlagApi, useValue: MOCK_FLAG_API },
  { provide: SegmentApi, useValue: MOCK_SEGMENT_API },
  { provide: AuditApi, useValue: MOCK_AUDIT_API },
  { provide: ApiKeyApi, useValue: MOCK_API_KEY_API },
  { provide: Keycloak, useValue: MOCK_KEYCLOAK },
  { provide: KEYCLOAK_EVENT_SIGNAL, useValue: MOCK_KEYCLOAK_EVENT_SIGNAL },
];
