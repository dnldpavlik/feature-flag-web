import { TestBed } from '@angular/core/testing';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { FlagStore } from './flag.store';
import {
  injectService,
  expectHasItems,
  expectItemCount,
  expectIdPattern,
  getCountBefore,
  expectItemAdded,
  expectItemRemoved,
  expectItemNotExists,
} from '@/app/testing';

describe('FlagStore', () => {
  let store: FlagStore;
  let environmentStore: EnvironmentStore;
  let projectStore: ProjectStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlagStore, EnvironmentStore, ProjectStore],
    });

    store = injectService(FlagStore);
    environmentStore = injectService(EnvironmentStore);
    projectStore = injectService(ProjectStore);
  });

  describe('initial state', () => {
    it('should seed initial flags', () => {
      expectHasItems(store.flags);
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

    it('should have flags with projectId', () => {
      const flag = store.flags()[0];
      expect(flag.projectId).toBeDefined();
      expect(flag.projectId).toMatch(/^proj_/);
    });

    it('should split seed flags between projects', () => {
      const defaultProjectFlags = store.flags().filter((f) => f.projectId === 'proj_default');
      const growthProjectFlags = store.flags().filter((f) => f.projectId === 'proj_growth');
      expect(defaultProjectFlags.length).toBeGreaterThan(0);
      expect(growthProjectFlags.length).toBeGreaterThan(0);
    });
  });

  describe('addFlag', () => {
    it('should add a new boolean flag to the list', () => {
      const countBefore = getCountBefore(store.flags);

      store.addFlag({
        projectId: 'proj_default',
        key: 'test-flag',
        name: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: false,
        tags: ['test'],
      });

      expectItemAdded(store.flags, countBefore);
      expect(store.flags()[0].key).toBe('test-flag');
      expectIdPattern(store.flags()[0].id, 'flag');
    });

    it('should add a new string flag', () => {
      store.addFlag({
        projectId: 'proj_default',
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
        projectId: 'proj_default',
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
        projectId: 'proj_default',
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
        projectId: 'proj_default',
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
        projectId: 'proj_default',
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

    it('should store projectId on the created flag', () => {
      store.addFlag({
        projectId: 'proj_growth',
        key: 'growth-flag',
        name: 'Growth Flag',
        description: 'A flag for growth project',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.projectId).toBe('proj_growth');
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

  describe('project-aware computed selectors', () => {
    it('should return flags for selected project', () => {
      projectStore.selectProject('proj_default');
      const defaultProjectFlags = store.flagsInSelectedProject();
      expect(defaultProjectFlags.every((f) => f.projectId === 'proj_default')).toBe(true);
    });

    it('should update flags when project selection changes', () => {
      projectStore.selectProject('proj_default');
      const defaultCount = store.flagsInSelectedProject().length;

      projectStore.selectProject('proj_growth');
      const growthCount = store.flagsInSelectedProject().length;

      // Both should have flags but different ones
      expect(defaultCount).toBeGreaterThan(0);
      expect(growthCount).toBeGreaterThan(0);
    });

    it('should filter enabledFlagsInCurrentEnvironment by project', () => {
      // Enable a flag in proj_default
      const defaultFlag = store.flags().find((f) => f.projectId === 'proj_default');
      store.toggleFlagInEnvironment(defaultFlag!.id, 'env_development', true);

      projectStore.selectProject('proj_default');
      expect(store.enabledFlagsInCurrentEnvironment().some((f) => f.id === defaultFlag!.id)).toBe(
        true,
      );

      projectStore.selectProject('proj_growth');
      expect(store.enabledFlagsInCurrentEnvironment().some((f) => f.id === defaultFlag!.id)).toBe(
        false,
      );
    });
  });

  describe('deleteFlag', () => {
    it('should remove flag by id', () => {
      const flagToDelete = store.flags()[0];
      const countBefore = getCountBefore(store.flags);

      store.deleteFlag(flagToDelete.id);

      expectItemRemoved(store.flags, countBefore);
      expectItemNotExists(store.flags, flagToDelete.id);
    });

    it('should preserve other flags', () => {
      const flagToDelete = store.flags()[0];
      const otherFlags = store.flags().slice(1);

      store.deleteFlag(flagToDelete.id);

      for (const flag of otherFlags) {
        expect(store.getFlagById(flag.id)).toBeDefined();
      }
    });

    it('should not delete last remaining flag', () => {
      // Delete all but one
      const flags = store.flags();
      for (let i = 0; i < flags.length - 1; i++) {
        store.deleteFlag(flags[i].id);
      }

      expectItemCount(store.flags, 1);

      // Try to delete the last one
      store.deleteFlag(store.flags()[0].id);

      expectItemCount(store.flags, 1);
    });

    it('should ignore non-existent id', () => {
      const beforeCount = store.flags().length;

      store.deleteFlag('flag_nonexistent');

      expect(store.flags().length).toBe(beforeCount);
    });

    it('should update totalCount after deletion', () => {
      const beforeCount = store.totalCount();
      const flagToDelete = store.flags()[0];

      store.deleteFlag(flagToDelete.id);

      expect(store.totalCount()).toBe(beforeCount - 1);
    });
  });

  describe('getValueInEnvironment', () => {
    it('should return value for specific environment', () => {
      store.addFlag({
        projectId: 'proj_default',
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
        projectId: 'proj_default',
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
