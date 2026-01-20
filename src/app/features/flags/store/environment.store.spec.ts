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
