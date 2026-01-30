import { Location } from '@angular/common';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { Flag } from '@/app/features/flags/models/flag.model';
import { EnvironmentFlagValue } from '@/app/features/flags/models/flag-value.model';
import { FlagDetailComponent } from './flag-detail';
import {
  expectHeading,
  expectEmptyState,
  expectExists,
  expectNotExists,
  queryAll,
  injectService,
  setFormField,
  getFormField,
  setFormFields,
  setupDetailComponentTest,
} from '@/app/testing';

type FlagDetailInternals = FlagDetailComponent & {
  setDefaultValueFields(flag: Flag): void;
  environmentRows(): { id: string; enabled: boolean; value: Flag['defaultValue'] }[];
  flagId(): string;
};

type FlagStoreInternals = FlagStore & {
  _flags: { update: (updater: (flags: Flag[]) => Flag[]) => void };
};

describe('FlagDetail', () => {
  let fixture: ComponentFixture<FlagDetailComponent>;
  let component: FlagDetailComponent;
  let store: FlagStore;
  let projectStore: ProjectStore;
  let router: Router;
  let location: Location;

  const ctx = setupDetailComponentTest({
    component: FlagDetailComponent,
    paramName: 'flagId',
    providers: [FlagStore, EnvironmentStore, ProjectStore],
  });

  const build = async (flagId?: string) => {
    await ctx.build(flagId);
    fixture = ctx.fixture;
    component = ctx.component;
    router = ctx.router;
    location = ctx.location;
    store = injectService(FlagStore);
    projectStore = injectService(ProjectStore);
  };

  it('should render flag details when flag exists', async () => {
    await build('flag_new_checkout');

    expectHeading(fixture, 'New Checkout Experience');

    const envRows = queryAll(fixture, '.flag-detail__env-row');
    expect(envRows.length).toBeGreaterThan(0);
  });

  it('should update flag metadata on save', async () => {
    await build('flag_new_checkout');

    setFormFields(component, {
      name: 'Updated Flag',
      description: 'Updated description',
      tags: 'alpha, beta',
    });

    component.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.name).toBe('Updated Flag');
    expect(updated?.description).toBe('Updated description');
    expect(updated?.tags).toEqual(['alpha', 'beta']);
  });

  it('should keep original name when blank input is saved', async () => {
    await build('flag_new_checkout');

    const original = store.getFlagById('flag_new_checkout');
    setFormField(component, 'name', '  ');
    component.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.name).toBe(original?.name);
  });

  it('should update json default value when valid', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    setFormField(component, 'jsonValue', '{"limit": 5}');
    component.saveDetails();

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.defaultValue).toEqual({ limit: 5 });
    expect(component.jsonError()).toBeNull();
  });

  it('should initialize string default value', async () => {
    await build('flag_beta_theme');

    expect(getFormField(component, 'stringValue')).toBe('default');
  });

  it('should initialize json default value string', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const initial = store.getFlagById('flag_checkout_guardrails');
    expect(getFormField(component, 'jsonValue')).toBe(
      JSON.stringify(initial?.defaultValue ?? {}, null, 2),
    );
  });

  it('should set default values for all flag types', async () => {
    await build('flag_new_checkout');

    const booleanFlag = store.getFlagById('flag_new_checkout');
    const stringFlag = store.getFlagById('flag_beta_theme');
    const numberFlag = store.getFlagById('flag_search_boost');
    const jsonFlag = store.getFlagById('flag_checkout_guardrails');

    (component as FlagDetailInternals).setDefaultValueFields(booleanFlag as Flag);
    expect(getFormField(component, 'booleanValue')).toBe(false);

    (component as FlagDetailInternals).setDefaultValueFields(stringFlag as Flag);
    expect(getFormField(component, 'stringValue')).toBe('default');

    (component as FlagDetailInternals).setDefaultValueFields(numberFlag as Flag);
    expect(getFormField(component, 'numberValue')).toBe(1);

    (component as FlagDetailInternals).setDefaultValueFields(jsonFlag as Flag);
    expect(getFormField(component, 'jsonValue')).toBe(
      JSON.stringify(jsonFlag?.defaultValue ?? {}, null, 2),
    );
  });

  it('should fall back to defaults for missing default values', async () => {
    await build('flag_new_checkout');

    const fallbackString: Flag = {
      id: 'flag_missing_string',
      projectId: 'proj_default',
      key: 'missing-string',
      name: 'Missing String',
      description: '',
      type: 'string',
      defaultValue: undefined as unknown as Flag['defaultValue'],
      tags: [],
      environmentValues: {} as Record<string, EnvironmentFlagValue>,
      createdAt: '',
      updatedAt: '',
    };

    const fallbackNumber: Flag = {
      ...fallbackString,
      id: 'flag_missing_number',
      key: 'missing-number',
      name: 'Missing Number',
      type: 'number',
    };

    const fallbackJson: Flag = {
      ...fallbackString,
      id: 'flag_missing_json',
      key: 'missing-json',
      name: 'Missing Json',
      type: 'json',
    };

    (component as FlagDetailInternals).setDefaultValueFields(fallbackString);
    expect(getFormField(component, 'stringValue')).toBe('');

    (component as FlagDetailInternals).setDefaultValueFields(fallbackNumber);
    expect(getFormField(component, 'numberValue')).toBe(0);

    (component as FlagDetailInternals).setDefaultValueFields(fallbackJson);
    expect(getFormField(component, 'jsonValue')).toBe('{}');
  });

  it('should update string default value', async () => {
    await build('flag_beta_theme');

    setFormField(component, 'stringValue', 'new-default');
    component.saveDetails();

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.defaultValue).toBe('new-default');
  });

  it('should update number default value', async () => {
    await build('flag_search_boost');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    setFormField(component, 'numberValue', 9);
    component.saveDetails();

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.defaultValue).toBe(9);
  });

  it('should update boolean default value', async () => {
    await build('flag_new_checkout');

    setFormField(component, 'booleanValue', true);
    component.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.defaultValue).toBe(true);
  });

  it('should not save when json is invalid', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const original = store.getFlagById('flag_checkout_guardrails');
    setFormField(component, 'jsonValue', 'invalid json');
    component.saveDetails();

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.defaultValue).toEqual(original?.defaultValue);
    expect(component.jsonError()).toBe('Invalid JSON syntax');
  });

  it('should not accept array json default values', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    setFormField(component, 'jsonValue', '[1, 2, 3]');
    component.saveDetails();

    expect(component.jsonError()).toBe('JSON must be an object');
  });

  it('should show empty state when flag is missing', async () => {
    await build('missing_flag');

    expectEmptyState(fixture);
  });

  it('should return an empty environment list when flag is missing', async () => {
    await build('missing_flag');

    const rows = (component as FlagDetailInternals).environmentRows();
    expect(rows).toEqual([]);
  });

  it('should toggle environment enabled state', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    component.toggleEnvironment(envId, false);

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].enabled).toBe(false);
  });

  it('should update environment value for boolean flag', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    component.updateEnvironmentValue(envId, 'false');

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].value).toBe(false);
  });

  it('should update environment value for string flag', async () => {
    await build('flag_beta_theme');

    const envId = 'env_development';
    component.updateEnvironmentValue(envId, 'updated');

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.environmentValues[envId].value).toBe('updated');
  });

  it('should update environment value for number flag', async () => {
    await build('flag_search_boost');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const envId = 'env_development';
    component.updateEnvironmentValue(envId, '4.2');

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.environmentValues[envId].value).toBe(4.2);
  });

  it('should update environment value for json flag', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const envId = 'env_development';
    component.updateEnvironmentValue(envId, '{"limit": 42}');

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.environmentValues[envId].value).toEqual({ limit: 42 });
  });

  it('should compute environment rows with fallback values', async () => {
    await build('flag_new_checkout');

    (store as FlagStoreInternals)._flags.update((flags: Flag[]) =>
      flags.map((flag) => {
        if (flag.id !== 'flag_new_checkout') return flag;
        const rest = { ...flag.environmentValues };
        delete rest.env_development;
        return { ...flag, environmentValues: rest };
      }),
    );

    const rows = (component as FlagDetailInternals).environmentRows();
    const row = rows.find((item) => item.id === 'env_development');
    expect(row?.enabled).toBe(false);
    expect(row?.value).toBe(false);
  });

  it('should ignore invalid number environment values', async () => {
    await build('flag_search_boost');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const envId = 'env_development';
    const original = store.getFlagById('flag_search_boost');
    component.updateEnvironmentValue(envId, 'not-a-number');

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.environmentValues[envId].value).toBe(original?.environmentValues[envId].value);
  });

  it('should ignore invalid json environment values', async () => {
    await build('flag_checkout_guardrails');
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const envId = 'env_development';
    const original = store.getFlagById('flag_checkout_guardrails');
    component.updateEnvironmentValue(envId, 'not-json');

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.environmentValues[envId].value).toEqual(
      original?.environmentValues[envId].value,
    );
  });

  it('should skip updates when flag is missing', async () => {
    await build('missing_flag');

    const updateSpy = jest.spyOn(store, 'updateFlagDetails');
    const toggleSpy = jest.spyOn(store, 'toggleFlagInEnvironment');
    const envSpy = jest.spyOn(store, 'updateEnvironmentValue');

    component.saveDetails();
    component.toggleEnvironment('env_development', true);
    component.updateEnvironmentValue('env_development', 'true');

    expect(updateSpy).not.toHaveBeenCalled();
    expect(toggleSpy).not.toHaveBeenCalled();
    expect(envSpy).not.toHaveBeenCalled();
  });

  it('should default the flag id when the route param is missing', async () => {
    await build();

    expect((component as FlagDetailInternals).flagId()).toBe('');
  });

  it('should discard edits and navigate back on cancel', async () => {
    await build('flag_beta_theme');

    setFormFields(component, {
      name: 'Changed Name',
      tags: 'one, two',
      stringValue: 'temporary',
    });

    component.cancelChanges();

    const current = store.getFlagById('flag_beta_theme');
    expect(getFormField(component, 'name')).toBe(current?.name);
    expect(getFormField(component, 'tags')).toBe(current?.tags.join(', '));
    expect(getFormField(component, 'stringValue')).toBe(current?.defaultValue);
    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate back on cancel when flag is missing', async () => {
    await build('missing_flag');

    component.cancelChanges();

    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate back to list', async () => {
    await build('flag_new_checkout');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.backToList();

    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });

  describe('flag deletion', () => {
    it('should show delete button when more than one flag exists', async () => {
      await build('flag_new_checkout');

      expectExists(fixture, '.flag-detail__delete-btn');
    });

    it('should hide delete button when only one flag exists', async () => {
      await build('flag_new_checkout');

      // Delete all but one flag
      const flags = store.flags();
      for (let i = 0; i < flags.length - 1; i++) {
        store.deleteFlag(flags[i].id);
      }
      fixture.detectChanges();

      expectNotExists(fixture, '.flag-detail__delete-btn');
    });

    it('should delete flag and navigate to /flags', async () => {
      await build('flag_new_checkout');

      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const beforeCount = store.flags().length;

      component.deleteFlag();

      expect(store.flags().length).toBe(beforeCount - 1);
      expect(store.getFlagById('flag_new_checkout')).toBeUndefined();
      expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
    });

    it('should not delete when flag is null', async () => {
      await build('missing_flag');

      const deleteSpy = jest.spyOn(store, 'deleteFlag');
      component.deleteFlag();

      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  it('should format json values for display', async () => {
    await build('flag_new_checkout');

    const formatted = component.formatJsonValue({ ready: true });
    expect(formatted).toBe(JSON.stringify({ ready: true }));
  });

  describe('project scope validation', () => {
    it('should show empty state when flag belongs to different project', async () => {
      // flag_new_checkout belongs to proj_default
      await build('flag_new_checkout');
      // Now switch to a different project
      projectStore.selectProject('proj_growth');
      fixture.detectChanges();

      expectEmptyState(fixture);
    });

    it('should show flag details when flag belongs to selected project', async () => {
      // flag_new_checkout belongs to proj_default
      await build('flag_new_checkout');
      projectStore.selectProject('proj_default');
      fixture.detectChanges();

      expectHeading(fixture, 'New Checkout Experience');
    });
  });

  it('should set and get description value', async () => {
    await build('flag_new_checkout');

    setFormField(component, 'description', 'Test description');
    expect(getFormField(component, 'description')).toBe('Test description');
  });

  it('should toggle environment via event handler', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    component.onEnvironmentToggle(envId, false);

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].enabled).toBe(false);
  });

  it('should update environment value via event handler', async () => {
    await build('flag_beta_theme');

    const envId = 'env_development';
    const event = { target: { value: 'new-value' } } as unknown as Event;
    component.onEnvironmentValueChange(envId, event);

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.environmentValues[envId].value).toBe('new-value');
  });
});
