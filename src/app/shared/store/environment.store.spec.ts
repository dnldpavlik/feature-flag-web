import { TestBed } from '@angular/core/testing';

import { EnvironmentStore } from './environment.store';

describe('EnvironmentStore', () => {
  let store: EnvironmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentStore],
    });

    store = TestBed.inject(EnvironmentStore);
  });

  describe('initial state', () => {
    it('should seed initial environments', () => {
      expect(store.environments().length).toBe(3);
    });

    it('should have development, staging, and production environments', () => {
      const keys = store.environments().map((e) => e.key);
      expect(keys).toContain('development');
      expect(keys).toContain('staging');
      expect(keys).toContain('production');
    });

    it('should have development as selected by default', () => {
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
    it('should set the default environment and clear others', () => {
      store.setDefaultEnvironment('env_staging');

      const defaults = store.environments().filter((env) => env.isDefault);
      expect(defaults.length).toBe(1);
      expect(defaults[0].id).toBe('env_staging');
    });
  });

  describe('addEnvironment', () => {
    it('should add a new environment', () => {
      const initialCount = store.environments().length;

      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      expect(store.environments().length).toBe(initialCount + 1);
    });

    it('should set environment properties correctly', () => {
      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = store.environments().find((e) => e.key === 'qa');
      expect(qa).toBeDefined();
      expect(qa?.name).toBe('QA');
      expect(qa?.color).toBe('#8B5CF6');
      expect(qa?.order).toBe(3);
    });

    it('should generate an ID for new environment', () => {
      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = store.environments().find((e) => e.key === 'qa');
      expect(qa?.id).toMatch(/^env_/);
    });

    it('should set timestamps on new environment', () => {
      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = store.environments().find((e) => e.key === 'qa');
      expect(qa?.createdAt).toBeDefined();
      expect(qa?.updatedAt).toBeDefined();
    });

    it('should default isDefault to false', () => {
      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      });

      const qa = store.environments().find((e) => e.key === 'qa');
      expect(qa?.isDefault).toBe(false);
    });

    it('should respect isDefault when provided', () => {
      store.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
        isDefault: true,
      });

      const qa = store.environments().find((e) => e.key === 'qa');
      expect(qa?.isDefault).toBe(true);
    });
  });

  describe('updateEnvironment', () => {
    it('should update name of existing environment', () => {
      store.updateEnvironment('env_staging', { name: 'QA Staging' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('QA Staging');
    });

    it('should update key of existing environment', () => {
      store.updateEnvironment('env_staging', { key: 'qa-staging' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.key).toBe('qa-staging');
    });

    it('should update color of existing environment', () => {
      store.updateEnvironment('env_staging', { color: '#8B5CF6' });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.color).toBe('#8B5CF6');
    });

    it('should update multiple fields at once', () => {
      store.updateEnvironment('env_staging', {
        name: 'Pre-Prod',
        key: 'pre-prod',
        color: '#6366F1',
      });

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('Pre-Prod');
      expect(env?.key).toBe('pre-prod');
      expect(env?.color).toBe('#6366F1');
    });

    it('should update updatedAt timestamp', () => {
      const before = store.getEnvironmentById('env_staging')?.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      store.updateEnvironment('env_staging', { name: 'Updated' });

      const after = store.getEnvironmentById('env_staging')?.updatedAt;
      expect(after).toBeDefined();
      expect(after).not.toBe(before);

      jest.useRealTimers();
    });

    it('should preserve fields not included in updates', () => {
      const original = store.getEnvironmentById('env_staging')!;

      store.updateEnvironment('env_staging', { name: 'New Name' });

      const updated = store.getEnvironmentById('env_staging')!;
      expect(updated.key).toBe(original.key);
      expect(updated.color).toBe(original.color);
      expect(updated.order).toBe(original.order);
      expect(updated.isDefault).toBe(original.isDefault);
      expect(updated.createdAt).toBe(original.createdAt);
    });

    it('should ignore non-existent environment id', () => {
      const before = store.environments().map((e) => ({ ...e }));

      store.updateEnvironment('env_nonexistent', { name: 'Ghost' });

      const after = store.environments();
      expect(after.length).toBe(before.length);
      after.forEach((env, i) => {
        expect(env.name).toBe(before[i].name);
      });
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
});
