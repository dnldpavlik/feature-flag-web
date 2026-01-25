import { TestBed } from '@angular/core/testing';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from './flag.store';

describe('FlagStore', () => {
  let store: FlagStore;
  let environmentStore: EnvironmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlagStore, EnvironmentStore],
    });

    store = TestBed.inject(FlagStore);
    environmentStore = TestBed.inject(EnvironmentStore);
  });

  describe('initial state', () => {
    it('should seed initial flags', () => {
      expect(store.flags().length).toBeGreaterThan(0);
      expect(store.totalCount()).toBe(store.flags().length);
    });

    it('should have flags with defaultValue', () => {
      const flag = store.flags()[0];
      expect(flag.defaultValue).toBeDefined();
    });

    it('should have flags with environmentValues', () => {
      const flag = store.flags()[0];
      expect(flag.environmentValues).toBeDefined();
      expect(typeof flag.environmentValues).toBe('object');
    });
  });

  describe('addFlag', () => {
    it('should add a new boolean flag to the list', () => {
      const beforeCount = store.flags().length;

      store.addFlag({
        key: 'test-flag',
        name: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: false,
        tags: ['test'],
      });

      expect(store.flags().length).toBe(beforeCount + 1);
      expect(store.flags()[0].key).toBe('test-flag');
      expect(store.flags()[0].id).toMatch(/^flag_/);
    });

    it('should add a new string flag', () => {
      store.addFlag({
        key: 'string-flag',
        name: 'String Flag',
        description: 'A string flag',
        type: 'string',
        defaultValue: 'hello',
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('string');
      expect(flag.defaultValue).toBe('hello');
    });

    it('should add a new number flag', () => {
      store.addFlag({
        key: 'number-flag',
        name: 'Number Flag',
        description: 'A number flag',
        type: 'number',
        defaultValue: 42,
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('number');
      expect(flag.defaultValue).toBe(42);
    });

    it('should add a new json flag', () => {
      store.addFlag({
        key: 'json-flag',
        name: 'JSON Flag',
        description: 'A JSON flag',
        type: 'json',
        defaultValue: { key: 'value' },
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('json');
      expect(flag.defaultValue).toEqual({ key: 'value' });
    });

    it('should initialize environment values for all environments', () => {
      store.addFlag({
        key: 'test-flag',
        name: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: true,
        tags: [],
      });

      const flag = store.flags()[0];
      const envIds = Object.keys(flag.environmentValues);

      expect(envIds).toContain('env_development');
      expect(envIds).toContain('env_staging');
      expect(envIds).toContain('env_production');
    });

    it('should set default value in environment values', () => {
      store.addFlag({
        key: 'test-flag',
        name: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: true,
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.environmentValues['env_development'].value).toBe(true);
    });
  });

  describe('getFlagById', () => {
    it('should find flag by ID', () => {
      const firstFlag = store.flags()[0];
      const found = store.getFlagById(firstFlag.id);
      expect(found).toBeDefined();
      expect(found?.key).toBe(firstFlag.key);
    });

    it('should return undefined for non-existent ID', () => {
      const found = store.getFlagById('flag_nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('updateFlagDetails', () => {
    it('should update name, description, tags, and default value', () => {
      const flag = store.flags()[0];

      store.updateFlagDetails(flag.id, {
        name: 'Renamed Flag',
        description: 'Updated description',
        tags: ['alpha', 'beta'],
        defaultValue: false,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.name).toBe('Renamed Flag');
      expect(updated?.description).toBe('Updated description');
      expect(updated?.tags).toEqual(['alpha', 'beta']);
      expect(updated?.defaultValue).toBe(false);
    });
  });

  describe('updateEnvironmentValue', () => {
    it('should update value in specific environment', () => {
      const flag = store.flags()[0];
      const newValue = flag.type === 'boolean' ? true : 'updated';

      store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: newValue,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_staging'].value).toBe(newValue);
    });

    it('should not affect other environments', () => {
      const flag = store.flags()[0];
      const originalDevValue = flag.environmentValues['env_development']?.value;

      store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: flag.type === 'boolean' ? true : 'updated',
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development']?.value).toBe(originalDevValue);
    });

    it('should update enabled state when provided', () => {
      const flag = store.flags()[0];

      store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        enabled: true,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_staging'].enabled).toBe(true);
    });

    it('should fall back to defaults when environment value does not exist', () => {
      environmentStore.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#00FFFF',
        order: 3,
        isDefault: false,
      });

      const qaEnv = environmentStore.environments().slice(-1)[0];
      const flag = store.flags()[0];

      store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: qaEnv!.id,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues[qaEnv!.id].value).toBe(flag.defaultValue);
      expect(updated?.environmentValues[qaEnv!.id].enabled).toBe(false);
    });
  });

  describe('toggleFlagInEnvironment', () => {
    it('should enable flag in environment', () => {
      const flag = store.flags()[0];

      store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(true);
    });

    it('should disable flag in environment', () => {
      const flag = store.flags()[0];

      store.toggleFlagInEnvironment(flag.id, 'env_development', false);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(false);
    });

    it('should not affect enabled state in other environments', () => {
      const flag = store.flags()[0];

      store.toggleFlagInEnvironment(flag.id, 'env_development', true);
      store.toggleFlagInEnvironment(flag.id, 'env_staging', false);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(true);
      expect(updated?.environmentValues['env_staging'].enabled).toBe(false);
    });

    it('should fall back to default value when toggling in new environment', () => {
      environmentStore.addEnvironment({
        key: 'sandbox',
        name: 'Sandbox',
        color: '#FF00FF',
        order: 4,
        isDefault: false,
      });

      const sandboxEnv = environmentStore.environments().slice(-1)[0];
      const flag = store.flags()[0];

      store.toggleFlagInEnvironment(flag.id, sandboxEnv!.id, true);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues[sandboxEnv!.id].value).toBe(flag.defaultValue);
      expect(updated?.environmentValues[sandboxEnv!.id].enabled).toBe(true);
    });
  });

  describe('environment-aware computed selectors', () => {
    it('should track current environment ID from environment store', () => {
      expect(store.currentEnvironmentId()).toBe('env_development');

      environmentStore.selectEnvironment('env_production');

      expect(store.currentEnvironmentId()).toBe('env_production');
    });

    it('should return enabled flags in current environment', () => {
      const flag = store.flags()[0];
      store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      const enabledFlags = store.enabledFlagsInCurrentEnvironment();

      expect(enabledFlags.some((f) => f.id === flag.id)).toBe(true);
    });

    it('should update enabled flags when environment changes', () => {
      const flag = store.flags()[0];
      store.toggleFlagInEnvironment(flag.id, 'env_development', true);
      store.toggleFlagInEnvironment(flag.id, 'env_staging', false);

      environmentStore.selectEnvironment('env_development');
      expect(store.enabledFlagsInCurrentEnvironment().some((f) => f.id === flag.id)).toBe(true);

      environmentStore.selectEnvironment('env_staging');
      expect(store.enabledFlagsInCurrentEnvironment().some((f) => f.id === flag.id)).toBe(false);
    });
  });

  describe('getValueInEnvironment', () => {
    it('should return value for specific environment', () => {
      store.addFlag({
        key: 'test-flag',
        name: 'Test Flag',
        description: 'A test flag',
        type: 'string',
        defaultValue: 'default',
        tags: [],
      });

      const flag = store.flags()[0];
      store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: 'staging-value',
      });

      expect(store.getValueInEnvironment(flag.id, 'env_staging')).toBe('staging-value');
    });

    it('should return default value when environment has no specific value', () => {
      store.addFlag({
        key: 'new-flag',
        name: 'New Flag',
        description: 'A new flag',
        type: 'string',
        defaultValue: 'my-default',
        tags: [],
      });

      const flag = store.flags()[0];
      expect(store.getValueInEnvironment(flag.id, 'env_development')).toBe('my-default');
    });

    it('should return undefined for non-existent flag', () => {
      expect(store.getValueInEnvironment('flag_nonexistent', 'env_development')).toBeUndefined();
    });
  });
});
