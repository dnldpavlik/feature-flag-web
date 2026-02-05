import { TestBed } from '@angular/core/testing';

import { EnvironmentStore } from './environment.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import {
  expectItemAdded,
  findByKey,
  injectService,
  MOCK_API_PROVIDERS,
  MOCK_ENVIRONMENTS,
} from '@/app/testing';

describe('EnvironmentStore', () => {
  let store: EnvironmentStore;
  let auditStore: AuditStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [EnvironmentStore, AuditStore, ...MOCK_API_PROVIDERS],
    });

    store = injectService(EnvironmentStore);
    auditStore = injectService(AuditStore);
    await store.loadEnvironments();
  });

  describe('initial state', () => {
    it('should load environments from API', () => {
      expect(store.environments().length).toBe(MOCK_ENVIRONMENTS.length);
    });

    it('should have development, staging, and production environments', () => {
      const keys = store.environments().map((e) => e.key);
      expect(keys).toContain('development');
      expect(keys).toContain('staging');
      expect(keys).toContain('production');
    });

    it('should auto-select default environment after load', () => {
      expect(store.selectedEnvironmentId()).toBe('env_development');
    });
  });

  describe('sortedEnvironments', () => {
    it('should return environments sorted by order', () => {
      const sorted = store.sortedEnvironments();
      expect(sorted[0].key).toBe('development');
      expect(sorted[1].key).toBe('staging');
      expect(sorted[2].key).toBe('production');
    });
  });

  describe('selectedEnvironment', () => {
    it('should return the currently selected environment', () => {
      const selected = store.selectedEnvironment();
      expect(selected).toBeDefined();
      expect(selected?.key).toBe('development');
    });

    it('should update when selection changes', () => {
      store.selectEnvironment('env_production');
      const selected = store.selectedEnvironment();
      expect(selected?.key).toBe('production');
    });
  });

  describe('defaultEnvironment', () => {
    it('should return the default environment', () => {
      const defaultEnv = store.defaultEnvironment();
      expect(defaultEnv).toBeDefined();
      expect(defaultEnv?.isDefault).toBe(true);
      expect(defaultEnv?.key).toBe('development');
    });
  });

  describe('selectEnvironment', () => {
    it('should update selected environment ID', () => {
      store.selectEnvironment('env_staging');
      expect(store.selectedEnvironmentId()).toBe('env_staging');
    });

    it('should update selected environment ID to production', () => {
      store.selectEnvironment('env_production');
      expect(store.selectedEnvironmentId()).toBe('env_production');
    });
  });

  describe('setDefaultEnvironment', () => {
    it('should set the default environment and clear others', async () => {
      await store.setDefaultEnvironment('env_staging');

      const defaults = store.environments().filter((env) => env.isDefault);
      expect(defaults.length).toBe(1);
      expect(defaults[0].id).toBe('env_staging');
    });
  });

  describe('addEnvironment', () => {
    it('should add a new environment via API', async () => {
      const countBefore = store.environments().length;

      await store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      expectItemAdded(store.environments, countBefore);
    });

    it('should set environment properties from API response', async () => {
      await store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = findByKey(store.environments, 'qa');
      expect(qa).toBeDefined();
      expect(qa?.name).toBe('QA');
      expect(qa?.color).toBe('#8B5CF6');
      expect(qa?.order).toBe(3);
    });

    it('should receive ID from API', async () => {
      await store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = findByKey(store.environments, 'qa');
      expect(qa?.id).toBeDefined();
      expect(qa?.id).toMatch(/^env_/);
    });

    it('should default isDefault to false', async () => {
      await store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = findByKey(store.environments, 'qa');
      expect(qa?.isDefault).toBe(false);
    });

    it('should respect isDefault when provided', async () => {
      await store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
        isDefault: true,
      });

      const qa = findByKey(store.environments, 'qa');
      expect(qa?.isDefault).toBe(true);
    });
  });

  describe('updateEnvironment', () => {
    it('should update name of existing environment via API', async () => {
      await store.updateEnvironment('env_staging', { name: 'QA Staging' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('QA Staging');
    });

    it('should update key of existing environment via API', async () => {
      await store.updateEnvironment('env_staging', { key: 'qa-staging' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.key).toBe('qa-staging');
    });

    it('should update color of existing environment via API', async () => {
      await store.updateEnvironment('env_staging', { color: '#8B5CF6' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.color).toBe('#8B5CF6');
    });

    it('should update multiple fields at once via API', async () => {
      await store.updateEnvironment('env_staging', {
        name: 'Pre-Prod',
        key: 'pre-prod',
        color: '#6366F1',
      });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('Pre-Prod');
      expect(env?.key).toBe('pre-prod');
      expect(env?.color).toBe('#6366F1');
    });

    it('should preserve fields not included in updates', async () => {
      const original = store.getEnvironmentById('env_staging')!;

      await store.updateEnvironment('env_staging', { name: 'New Name' });

      const updated = store.getEnvironmentById('env_staging')!;
      expect(updated.key).toBe(original.key);
      expect(updated.color).toBe(original.color);
      expect(updated.order).toBe(original.order);
      expect(updated.isDefault).toBe(original.isDefault);
    });
  });

  describe('getEnvironmentById', () => {
    it('should find environment by ID', () => {
      const env = store.getEnvironmentById('env_staging');
      expect(env).toBeDefined();
      expect(env?.key).toBe('staging');
    });

    it('should return undefined for non-existent ID', () => {
      const env = store.getEnvironmentById('env_nonexistent');
      expect(env).toBeUndefined();
    });
  });

  describe('audit logging', () => {
    beforeEach(() => {
      jest.spyOn(auditStore, 'logAction');
    });

    it('should log audit entry when environment is created', async () => {
      await store.addEnvironment({
        key: 'audit-test-env',
        name: 'Audit Test Environment',
        color: '#FF0000',
        order: 5,
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created',
          resourceType: 'environment',
          resourceName: 'Audit Test Environment',
        }),
      );
    });

    it('should log audit entry when environment is updated', async () => {
      await store.updateEnvironment('env_staging', {
        name: 'Updated Staging',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updated',
          resourceType: 'environment',
          resourceId: 'env_staging',
          resourceName: 'Updated Staging',
        }),
      );
    });

    it('should include user info in audit entry', async () => {
      await store.addEnvironment({
        key: 'user-audit-env',
        name: 'User Audit Environment',
        color: '#00FF00',
        order: 6,
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          userName: expect.any(String),
        }),
      );
    });
  });
});
