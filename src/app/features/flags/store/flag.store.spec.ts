import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { FlagApi } from '@/app/features/flags/api/flag.api';
import { Flag } from '@/app/features/flags/models/flag.model';
import { FlagStore } from './flag.store';
import {
  injectService,
  expectHasItems,
  expectItemCount,
  expectItemAdded,
  expectItemRemoved,
  expectItemNotExists,
  MOCK_API_PROVIDERS,
  MOCK_FLAGS,
} from '@/app/testing';

describe('FlagStore', () => {
  let store: FlagStore;
  let environmentStore: EnvironmentStore;
  let projectStore: ProjectStore;
  let auditStore: AuditStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [FlagStore, EnvironmentStore, ProjectStore, AuditStore, ...MOCK_API_PROVIDERS],
    });

    store = injectService(FlagStore);
    environmentStore = injectService(EnvironmentStore);
    projectStore = injectService(ProjectStore);
    auditStore = injectService(AuditStore);
    await projectStore.loadProjects();
    await environmentStore.loadEnvironments();
    await store.loadFlags();
  });

  describe('initial state', () => {
    it('should load flags from API', () => {
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
    it('should add a new boolean flag to the list via API', async () => {
      const countBefore = store.flags().length;

      await store.addFlag({
        projectId: 'proj_default',
        key: 'test-flag',
        name: 'Test Flag',
        resourceName: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: false,
        tags: ['test'],
      });

      expectItemAdded(store.flags, countBefore);
      expect(store.flags()[0].key).toBe('test-flag');
      expect(store.flags()[0].id).toMatch(/^flag_/);
    });

    it('should add a new string flag via API', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'string-flag',
        name: 'String Flag',
        resourceName: 'String Flag',
        description: 'A string flag',
        type: 'string',
        defaultValue: 'hello',
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('string');
      expect(flag.defaultValue).toBe('hello');
    });

    it('should add a new number flag via API', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'number-flag',
        name: 'Number Flag',
        resourceName: 'Number Flag',
        description: 'A number flag',
        type: 'number',
        defaultValue: 42,
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('number');
      expect(flag.defaultValue).toBe(42);
    });

    it('should add a new json flag via API', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'json-flag',
        name: 'JSON Flag',
        resourceName: 'JSON Flag',
        description: 'A JSON flag',
        type: 'json',
        defaultValue: { key: 'value' },
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.type).toBe('json');
      expect(flag.defaultValue).toEqual({ key: 'value' });
    });

    it('should initialize environment values for all environments via API', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'test-flag',
        name: 'Test Flag',
        resourceName: 'Test Flag',
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

    it('should set default value in environment values via API', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'test-flag',
        name: 'Test Flag',
        resourceName: 'Test Flag',
        description: 'A test flag',
        type: 'boolean',
        defaultValue: true,
        tags: [],
      });

      const flag = store.flags()[0];
      expect(flag.environmentValues['env_development'].value).toBe(true);
    });

    it('should store projectId on the created flag via API', async () => {
      await store.addFlag({
        projectId: 'proj_growth',
        key: 'growth-flag',
        name: 'Growth Flag',
        resourceName: 'Growth Flag',
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
    it('should update name, description, tags, and default value via API', async () => {
      const flag = store.flags()[0];

      await store.updateFlagDetails(flag.id, {
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
    it('should update value in specific environment via API', async () => {
      const flag = store.flags()[0];
      const newValue = flag.type === 'boolean' ? true : 'updated';

      await store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: newValue,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_staging'].value).toBe(newValue);
    });

    it('should not affect other environments', async () => {
      const flag = store.flags()[0];
      const originalDevValue = flag.environmentValues['env_development']?.value;

      await store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: flag.type === 'boolean' ? true : 'updated',
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development']?.value).toBe(originalDevValue);
    });

    it('should update enabled state when provided via API', async () => {
      const flag = store.flags()[0];

      await store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        enabled: true,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_staging'].enabled).toBe(true);
    });

    it('should fall back to defaults when environment value does not exist', async () => {
      await environmentStore.addEnvironment({
        key: 'qa',
        name: 'QA',
        color: '#00FFFF',
        order: 3,
        isDefault: false,
      });

      const qaEnv = environmentStore.environments().slice(-1)[0];
      const flag = store.flags()[0];

      await store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: qaEnv!.id,
      });

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues[qaEnv!.id].value).toBe(flag.defaultValue);
      expect(updated?.environmentValues[qaEnv!.id].enabled).toBe(false);
    });
  });

  describe('toggleFlagInEnvironment', () => {
    it('should enable flag in environment via API', async () => {
      const flag = store.flags()[0];

      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(true);
    });

    it('should disable flag in environment via API', async () => {
      const flag = store.flags()[0];

      await store.toggleFlagInEnvironment(flag.id, 'env_development', false);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(false);
    });

    it('should not affect enabled state in other environments', async () => {
      const flag = store.flags()[0];

      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);
      await store.toggleFlagInEnvironment(flag.id, 'env_staging', false);

      const updated = store.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(true);
      expect(updated?.environmentValues['env_staging'].enabled).toBe(false);
    });

    it('should fall back to default value when toggling in new environment', async () => {
      await environmentStore.addEnvironment({
        key: 'sandbox',
        name: 'Sandbox',
        color: '#FF00FF',
        order: 4,
        isDefault: false,
      });

      const sandboxEnv = environmentStore.environments().slice(-1)[0];
      const flag = store.flags()[0];

      await store.toggleFlagInEnvironment(flag.id, sandboxEnv!.id, true);

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

    it('should return enabled flags in current environment', async () => {
      projectStore.selectProject('proj_default');
      const flag = store.flags()[0];
      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      const enabledFlags = store.enabledFlagsInCurrentEnvironment();

      expect(enabledFlags.some((f) => f.id === flag.id)).toBe(true);
    });

    it('should update enabled flags when environment changes', async () => {
      projectStore.selectProject('proj_default');
      const flag = store.flags()[0];
      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);
      await store.toggleFlagInEnvironment(flag.id, 'env_staging', false);

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

    it('should filter enabledFlagsInCurrentEnvironment by project', async () => {
      // Enable a flag in proj_default
      const defaultFlag = store.flags().find((f) => f.projectId === 'proj_default');
      await store.toggleFlagInEnvironment(defaultFlag!.id, 'env_development', true);

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
    it('should remove flag by id via API', async () => {
      const flagToDelete = store.flags()[0];
      const countBefore = store.flags().length;

      await store.deleteFlag(flagToDelete.id);

      expectItemRemoved(store.flags, countBefore);
      expectItemNotExists(store.flags, flagToDelete.id);
    });

    it('should preserve other flags', async () => {
      const flagToDelete = store.flags()[0];
      const otherFlags = store.flags().slice(1);

      await store.deleteFlag(flagToDelete.id);

      for (const flag of otherFlags) {
        expect(store.getFlagById(flag.id)).toBeDefined();
      }
    });

    it('should not delete last remaining flag', async () => {
      // Delete all but one
      const flags = store.flags();
      for (let i = 0; i < flags.length - 1; i++) {
        await store.deleteFlag(flags[i].id);
      }

      expectItemCount(store.flags, 1);

      // Try to delete the last one
      await store.deleteFlag(store.flags()[0].id);

      expectItemCount(store.flags, 1);
    });

    it('should ignore non-existent id', async () => {
      const beforeCount = store.flags().length;

      await store.deleteFlag('flag_nonexistent');

      expect(store.flags().length).toBe(beforeCount);
    });

    it('should update totalCount after deletion', async () => {
      const beforeCount = store.totalCount();
      const flagToDelete = store.flags()[0];

      await store.deleteFlag(flagToDelete.id);

      expect(store.totalCount()).toBe(beforeCount - 1);
    });
  });

  describe('getValueInEnvironment', () => {
    it('should return value for specific environment', async () => {
      // Use existing flag from mock data
      const flag = store.flags().find((f) => f.type === 'boolean')!;
      await store.updateEnvironmentValue({
        flagId: flag.id,
        environmentId: 'env_staging',
        value: true,
      });

      expect(store.getValueInEnvironment(flag.id, 'env_staging')).toBe(true);
    });

    it('should return default value for existing flag', () => {
      // Use existing flag to check default value retrieval
      const flag = store.flags()[0];
      const envId = 'env_development';
      const expected = flag.environmentValues[envId]?.value ?? flag.defaultValue;
      expect(store.getValueInEnvironment(flag.id, envId)).toBe(expected);
    });

    it('should return undefined for non-existent flag', () => {
      expect(store.getValueInEnvironment('flag_nonexistent', 'env_development')).toBeUndefined();
    });
  });

  describe('audit logging', () => {
    beforeEach(() => {
      jest.spyOn(auditStore, 'logAction');
    });

    it('should log audit entry when flag is created', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'audit-test-flag',
        name: 'Audit Test Flag',
        resourceName: 'Audit Test Flag',
        description: 'Testing audit logging',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created',
          resourceType: 'flag',
          resourceName: 'Audit Test Flag',
        }),
      );
    });

    it('should log audit entry when flag is updated', async () => {
      const flag = store.flags()[0];

      await store.updateFlagDetails(flag.id, {
        name: 'Updated Flag Name',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updated',
          resourceType: 'flag',
          resourceId: flag.id,
          resourceName: 'Updated Flag Name',
        }),
      );
    });

    it('should log audit entry when flag is deleted', async () => {
      const flag = store.flags()[0];
      const flagName = flag.name;

      await store.deleteFlag(flag.id);

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deleted',
          resourceType: 'flag',
          resourceId: flag.id,
          resourceName: flagName,
        }),
      );
    });

    it('should log audit entry when flag is toggled', async () => {
      const flag = store.flags()[0];

      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'toggled',
          resourceType: 'flag',
          resourceId: flag.id,
        }),
      );
    });

    it('should use environment ID in audit log when environment not found', async () => {
      const flag = store.flags()[0];
      const unknownEnvId = 'env_unknown_12345';

      await store.toggleFlagInEnvironment(flag.id, unknownEnvId, true);

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.stringContaining(unknownEnvId),
        }),
      );
    });

    it('should use existing flag name when toggle response lacks name', async () => {
      const flag = store.flags()[0];
      const flagApi = TestBed.inject(FlagApi);
      const responseWithoutName = {
        ...flag,
        name: undefined,
        environmentValues: {
          ...flag.environmentValues,
          env_development: {
            ...flag.environmentValues['env_development'],
            enabled: true,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      jest
        .spyOn(flagApi, 'updateEnvironmentValue')
        .mockReturnValue(of(responseWithoutName as unknown as Flag));

      await store.toggleFlagInEnvironment(flag.id, 'env_development', true);

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'toggled',
          resourceName: flag.name,
        }),
      );
    });

    it('should use input name when create response lacks name', async () => {
      const flagApi = TestBed.inject(FlagApi);
      jest.spyOn(flagApi, 'create').mockReturnValue(
        of({
          id: 'flag_no_name',
          projectId: 'proj_default',
          key: 'no-name',
          name: undefined,
          description: '',
          type: 'boolean',
          defaultValue: false,
          tags: [],
          environmentValues: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as Flag),
      );

      await store.addFlag({
        projectId: 'proj_default',
        key: 'no-name',
        name: 'Fallback Name',
        resourceName: 'Fallback Name',
        description: '',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created',
          resourceName: 'Fallback Name',
        }),
      );
    });

    it('should include user info in audit entry', async () => {
      await store.addFlag({
        projectId: 'proj_default',
        key: 'user-audit-flag',
        name: 'User Audit Flag',
        resourceName: 'User Audit Flag',
        description: 'Testing user info',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          userName: expect.any(String),
        }),
      );
    });
  });

  describe('getFlagsByProjectId', () => {
    it('should return all flags for the given project', () => {
      const defaultProjectFlags = store.getFlagsByProjectId('proj_default');
      expect(defaultProjectFlags.length).toBeGreaterThan(0);
      expect(defaultProjectFlags.every((f) => f.projectId === 'proj_default')).toBe(true);
    });

    it('should return empty array for project with no flags', () => {
      const flags = store.getFlagsByProjectId('proj_nonexistent');
      expect(flags).toEqual([]);
    });

    it('should return different flags for different projects', () => {
      const defaultFlags = store.getFlagsByProjectId('proj_default');
      const growthFlags = store.getFlagsByProjectId('proj_growth');

      expect(defaultFlags.length).toBeGreaterThan(0);
      expect(growthFlags.length).toBeGreaterThan(0);

      const defaultIds = new Set(defaultFlags.map((f) => f.id));
      const growthIds = new Set(growthFlags.map((f) => f.id));

      // No overlap between projects
      for (const id of growthIds) {
        expect(defaultIds.has(id)).toBe(false);
      }
    });
  });

  describe('deleteFlagsByProjectId', () => {
    it('should delete all flags for the given project', async () => {
      const defaultFlagsBefore = store.getFlagsByProjectId('proj_default');
      expect(defaultFlagsBefore.length).toBeGreaterThan(0);

      await store.deleteFlagsByProjectId('proj_default');

      const defaultFlagsAfter = store.getFlagsByProjectId('proj_default');
      expect(defaultFlagsAfter.length).toBe(0);
    });

    it('should not delete flags from other projects', async () => {
      const growthFlagsBefore = store.getFlagsByProjectId('proj_growth');
      const growthCount = growthFlagsBefore.length;

      await store.deleteFlagsByProjectId('proj_default');

      const growthFlagsAfter = store.getFlagsByProjectId('proj_growth');
      expect(growthFlagsAfter.length).toBe(growthCount);
    });

    it('should do nothing for project with no flags', async () => {
      const totalBefore = store.flags().length;

      await store.deleteFlagsByProjectId('proj_nonexistent');

      expect(store.flags().length).toBe(totalBefore);
    });
  });

  describe('addFlag with enabledEnvironments', () => {
    it('should call toggleFlagInEnvironment for enabled environments', async () => {
      const toggleSpy = jest.spyOn(store, 'toggleFlagInEnvironment');

      await store.addFlag(
        {
          projectId: 'proj_default',
          key: 'env-enabled-flag',
          name: 'Env Enabled Flag',
          resourceName: 'Env Enabled Flag',
          description: 'A flag with environments enabled',
          type: 'boolean',
          defaultValue: false,
          tags: [],
        },
        { env_development: true, env_staging: true, env_production: false },
      );

      // Should call toggle for dev and staging (both true), but not production (false)
      expect(toggleSpy).toHaveBeenCalledTimes(2);
      expect(toggleSpy).toHaveBeenCalledWith(expect.any(String), 'env_development', true);
      expect(toggleSpy).toHaveBeenCalledWith(expect.any(String), 'env_staging', true);
    });

    it('should not call toggleFlagInEnvironment when no environments are enabled', async () => {
      const toggleSpy = jest.spyOn(store, 'toggleFlagInEnvironment');

      await store.addFlag(
        {
          projectId: 'proj_default',
          key: 'no-toggle-flag',
          name: 'No Toggle Flag',
          resourceName: 'No Toggle Flag',
          description: 'A flag with no environments enabled',
          type: 'boolean',
          defaultValue: false,
          tags: [],
        },
        { env_development: false, env_staging: false },
      );

      expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('should reload flags after toggling environments', async () => {
      const loadSpy = jest.spyOn(store, 'loadFlags');

      await store.addFlag(
        {
          projectId: 'proj_default',
          key: 'reload-flag',
          name: 'Reload Flag',
          resourceName: 'Reload Flag',
          description: 'Tests reload after env toggles',
          type: 'boolean',
          defaultValue: false,
          tags: [],
        },
        { env_development: true },
      );

      expect(loadSpy).toHaveBeenCalled();
    });

    it('should not reload flags when no environments are toggled', async () => {
      const loadSpy = jest.spyOn(store, 'loadFlags');

      await store.addFlag(
        {
          projectId: 'proj_default',
          key: 'no-reload-flag',
          name: 'No Reload Flag',
          resourceName: 'No Reload Flag',
          description: 'No env toggles',
          type: 'boolean',
          defaultValue: false,
          tags: [],
        },
        { env_development: false, env_staging: false },
      );

      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should work without enabledEnvironments parameter', async () => {
      const countBefore = store.flags().length;

      await store.addFlag({
        projectId: 'proj_default',
        key: 'no-env-flag',
        name: 'No Env Flag',
        resourceName: 'No Env Flag',
        description: 'A flag without environment settings',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      expectItemAdded(store.flags, countBefore);
    });
  });

  describe('error handling', () => {
    let toastService: ToastService;
    let flagApi: FlagApi;

    beforeEach(async () => {
      toastService = injectService(ToastService);
      flagApi = injectService(FlagApi);
      jest.spyOn(toastService, 'error');
      // Ensure flags are loaded before each error test
      jest.restoreAllMocks();
      await store.loadFlags();
    });

    it('should set error state when loadFlags fails', async () => {
      jest.spyOn(flagApi, 'getAll').mockReturnValue(throwError(() => new Error('Network error')));

      await store.loadFlags();

      expect(store.error()).toBe('Network error');
      expect(store.loading()).toBe(false);
    });

    it('should use default message when loadFlags fails without Error', async () => {
      jest.spyOn(flagApi, 'getAll').mockReturnValue(throwError(() => 'string error'));

      await store.loadFlags();

      expect(store.error()).toBe('Failed to load flags');
    });

    it('should show toast when addFlag fails', async () => {
      jest.spyOn(toastService, 'error');
      jest.spyOn(flagApi, 'create').mockReturnValue(throwError(() => new Error('Create failed')));

      await store.addFlag({
        projectId: 'proj_default',
        key: 'fail-flag',
        name: 'Fail Flag',
        resourceName: 'Fail Flag',
        description: 'Will fail',
        type: 'boolean',
        defaultValue: false,
        tags: [],
      });

      expect(toastService.error).toHaveBeenCalledWith('Failed to create flag');
    });

    it('should show toast when deleteFlag fails', async () => {
      jest.spyOn(toastService, 'error');
      jest.spyOn(flagApi, 'delete').mockReturnValue(throwError(() => new Error('Delete failed')));
      // Use MOCK_FLAGS to get a valid flag ID
      const flagId = MOCK_FLAGS[0].id;

      await store.deleteFlag(flagId);

      expect(toastService.error).toHaveBeenCalledWith('Failed to delete flag');
    });

    it('should show toast when deleteFlagsByProjectId fails for a flag', async () => {
      jest.spyOn(toastService, 'error');
      // Get the flag name before mocking
      const flag = MOCK_FLAGS.find((f) => f.projectId === 'proj_default')!;
      jest.spyOn(flagApi, 'delete').mockReturnValue(throwError(() => new Error('Delete failed')));

      await store.deleteFlagsByProjectId('proj_default');

      expect(toastService.error).toHaveBeenCalledWith(`Failed to delete flag "${flag.name}"`);
    });

    it('should show toast when updateFlagDetails fails', async () => {
      jest.spyOn(toastService, 'error');
      jest.spyOn(flagApi, 'update').mockReturnValue(throwError(() => new Error('Update failed')));
      const flagId = MOCK_FLAGS[0].id;

      await store.updateFlagDetails(flagId, { name: 'New Name' });

      expect(toastService.error).toHaveBeenCalledWith('Failed to update flag');
    });

    it('should show toast when updateEnvironmentValue fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(flagApi, 'updateEnvironmentValue')
        .mockReturnValue(throwError(() => new Error('Update failed')));
      const flagId = MOCK_FLAGS[0].id;

      await store.updateEnvironmentValue({
        flagId,
        environmentId: 'env_development',
        value: true,
      });

      expect(toastService.error).toHaveBeenCalledWith('Failed to update environment value');
    });

    it('should show toast when toggleFlagInEnvironment fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(flagApi, 'updateEnvironmentValue')
        .mockReturnValue(throwError(() => new Error('Toggle failed')));
      const flagId = MOCK_FLAGS[0].id;

      await store.toggleFlagInEnvironment(flagId, 'env_development', true);

      expect(toastService.error).toHaveBeenCalledWith('Failed to toggle flag');
    });
  });
});
